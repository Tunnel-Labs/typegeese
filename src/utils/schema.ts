import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { versionStringToVersionNumber } from '~/utils/version.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import createClone from 'rfdc';
import {
	AnySchemaClass,
	BaseSchemaExtends,
	MigrationSchemaExtends,
	NewSchemaOptions
} from '~/types/schema.js';
import {
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchema
} from '~/types/hyperschema-module.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';

const clone = createClone();

/**
	Dynamically creates a full schema by going up the migration chain from a specified migration schema.
*/
export function createModelSchemaFromMigrationSchema({
	schemaName,
	migrationSchema
}: {
	schemaName: string;
	migrationSchema: AnySchemaClass;
}): AnySchemaClass {
	const modelSchema = class {} as AnySchemaClass;

	const migrationSchemasMap = Reflect.getMetadata(
		DecoratorKeys.MigrationSchemas,
		Schema
	) as Map<string, Map<number, AnySchemaClass>>;

	const migrationSchemaMap = migrationSchemasMap.get(schemaName);
	if (migrationSchemaMap === undefined) {
		throw new Error(`Could not find migration schema map for "${schemaName}"`);
	}

	const migrationSchemaVersion = versionStringToVersionNumber(
		migrationSchema.prototype._v
	);

	prop({ type: () => String, required: true })(modelSchema, '_id');
	prop({ type: () => Number, default: migrationSchemaVersion, required: true })(
		modelSchema,
		'_v'
	);

	Object.defineProperty(modelSchema, 'name', { value: schemaName });
	Object.defineProperty(modelSchema, '_v', { value: migrationSchemaVersion });

	// Loop through the migration chain
	const propMap = new Map();

	for (
		let currentMigrationSchemaVersion = migrationSchemaVersion;
		currentMigrationSchemaVersion >= 0;
		currentMigrationSchemaVersion -= 1
	) {
		const currentMigrationSchema = migrationSchemaMap.get(
			currentMigrationSchemaVersion
		);
		if (currentMigrationSchema === undefined) {
			throw new Error(
				`Could not find migration schema "${schemaName}" for version "${currentMigrationSchemaVersion}"`
			);
		}

		const currentMigrationSchemaPropMap = Reflect.getMetadata(
			DecoratorKeys.PropCache,
			currentMigrationSchema.prototype
		) as Map<string, { options?: { ref: string } }>;

		for (const [
			propKey,
			propValue
		] of currentMigrationSchemaPropMap.entries()) {
			propMap.set(propKey, propValue);
		}

		for (const propValue of propMap.values()) {
			(propValue as any).target = modelSchema.prototype;
		}
	}

	return modelSchema;
}

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

/**
	Instead of inheriting from the previous schema migration, we instead create a copy of the class (this makes it easier to use discriminator types)
*/
export function Schema<
	SchemaName extends string,
	Options extends NewSchemaOptions
>(name: SchemaName, options?: Options): BaseSchemaExtends<SchemaName, Options>;
export function Schema<
	PreviousUnnormalizedHyperschemaModule extends
		AnyUnnormalizedHyperschemaModule,
	Options extends {
		omit: {
			[K in keyof GetUnnormalizedHyperschemaModuleMigrationSchema<PreviousUnnormalizedHyperschemaModule>]?: true;
		};
	}
>(
	previousUnnormalizedHyperschemaModule: PreviousUnnormalizedHyperschemaModule,
	options?: Options
): MigrationSchemaExtends<PreviousUnnormalizedHyperschemaModule, Options>;
export function Schema(
	previousHyperschemaOrNewSchemaName?: any,
	options?: {
		omit: Record<string, true>;
	}
): any {
	let migrationSchemasMap = Reflect.getMetadata(
		DecoratorKeys.MigrationSchemas,
		Schema
	) as Map<
		string, // schema name
		Map<number, AnySchemaClass | null> // map from version number to schema
	>;

	if (migrationSchemasMap === undefined) {
		migrationSchemasMap = new Map();
		Reflect.defineMetadata(
			DecoratorKeys.MigrationSchemas,
			Schema,
			migrationSchemasMap
		);
	}

	if (typeof previousHyperschemaOrNewSchemaName === 'string') {
		const schemaName = previousHyperschemaOrNewSchemaName;
		let schemaMap = migrationSchemasMap.get(schemaName);
		if (schemaMap === undefined) {
			schemaMap = new Map();
			migrationSchemasMap.set(schemaName, schemaMap);
		}
	} else {
		const previousHyperschemaModule = normalizeHyperschemaModule(
			previousHyperschemaOrNewSchemaName
		);
		const { schemaName } = previousHyperschemaModule;
		let migrationSchemaMap = migrationSchemasMap.get(schemaName);
		if (migrationSchemaMap === undefined) {
			migrationSchemaMap = new Map();
			migrationSchemasMap.set(schemaName, migrationSchemaMap);
		}

		const previousVersionString =
			previousHyperschemaModule.migrationSchema.prototype._v;
		const currentVersionNumber =
			versionStringToVersionNumber(previousVersionString) + 1;

		migrationSchemaMap.set(
			currentVersionNumber,
			previousHyperschemaModule.migrationSchema
		);
	}

	// We return the `Object` constructor (which is basically equivalent to a no-op `extends` clause)
	// to avoid schema inheritance that might conflict with typegoose
	return Object;
}
