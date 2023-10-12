import { prop } from '@typegoose/typegoose';
import { SchemaOptions, model } from 'mongoose';
import { versionStringToVersionNumber } from '~/utils/version.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
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
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from '~/utils/migration-schema.js';
import createClone from 'rfdc';

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
	if ((migrationSchema as any).__modelSchema) {
		return (migrationSchema as any).__modelSchema;
	}

	const modelSchema = class {} as AnySchemaClass;

	const migrationSchemasMap = getMigrationSchemasMap();
	const migrationOptionsMap = getMigrationOptionsMap();

	const migrationSchemaMap = migrationSchemasMap.get(schemaName);
	if (migrationSchemaMap === undefined) {
		throw new Error(`Could not find migration schema map for "${schemaName}"`);
	}

	const migrationOptionMap = migrationOptionsMap.get(schemaName);
	if (migrationOptionMap === undefined) {
		throw new Error(`Could not find migration option map for "${schemaName}"`);
	}

	const migrationSchemaVersion = versionStringToVersionNumber(
		migrationSchema.prototype._v
	);

	Object.defineProperty(modelSchema, 'name', { value: schemaName });
	Object.defineProperty(modelSchema.prototype, '_v', {
		value: migrationSchema.prototype._v
	});

	// Loop through the migration chain
	const mergedPropMap = new Map();

	const currentMigrationSchemaPropMap =
		Reflect.getMetadata(DecoratorKeys.PropCache, migrationSchema.prototype) ??
		new Map();

	for (const [
		mergedPropKey,
		mergedPropValue
	] of currentMigrationSchemaPropMap.entries()) {
		mergedPropMap.set(mergedPropKey, clone(mergedPropValue));
	}

	const keysToOmit = new Set();

	for (
		let currentMigrationSchemaVersion = migrationSchemaVersion - 1;
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

		const currentMigrationOptions = migrationOptionMap.get(
			currentMigrationSchemaVersion
		);

		for (const [
			mergedPropKey,
			mergedPropValue
		] of currentMigrationSchemaPropMap.entries()) {
			if (keysToOmit.has(mergedPropKey)) {
				continue;
			}

			mergedPropMap.set(mergedPropKey, clone(mergedPropValue));
		}

		for (const key of Object.keys(currentMigrationOptions?.omit ?? {})) {
			keysToOmit.add(key);
		}
	}

	for (const propValue of mergedPropMap.values()) {
		(propValue as any).target = modelSchema.prototype;
	}

	Reflect.defineMetadata(
		DecoratorKeys.PropCache,
		mergedPropMap,
		modelSchema.prototype
	);

	prop({ type: () => String, required: true })(modelSchema.prototype, '_id');
	prop({ type: () => Number, default: migrationSchemaVersion, required: true })(
		modelSchema.prototype,
		'_v'
	);

	(migrationSchema as any).__modelSchema = modelSchema;

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
	const migrationSchemasMap = getMigrationSchemasMap();
	const migrationOptionsMap = getMigrationOptionsMap();

	if (typeof previousHyperschemaOrNewSchemaName === 'string') {
		const schemaName = previousHyperschemaOrNewSchemaName;
		let migrationSchemaMap = migrationSchemasMap.get(schemaName);
		if (migrationSchemaMap === undefined) {
			migrationSchemaMap = new Map();
			migrationSchemasMap.set(schemaName, migrationSchemaMap);
		}

		let migrationOptionMap = migrationOptionsMap.get(schemaName);
		if (migrationOptionMap === undefined) {
			migrationOptionMap = new Map();
			migrationOptionsMap.set(schemaName, migrationOptionMap);
		}

		migrationOptionMap.set(0, options);
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

		let migrationOptionMap = migrationOptionsMap.get(schemaName);
		if (migrationOptionMap === undefined) {
			migrationOptionMap = new Map();
			migrationOptionsMap.set(schemaName, migrationOptionMap);
		}

		const previousVersionString =
			previousHyperschemaModule.migrationSchema.prototype._v;
		const previousVersionNumber = versionStringToVersionNumber(
			previousVersionString
		);

		migrationSchemaMap.set(
			previousVersionNumber,
			previousHyperschemaModule.migrationSchema
		);

		const currentVersionNumber = previousVersionNumber + 1;
		migrationOptionMap.set(currentVersionNumber, options);
	}

	// We return the `Object` constructor (which is basically equivalent to a no-op `extends` clause)
	// to avoid schema inheritance that might conflict with typegoose
	return Object;
}
