import { prop } from '@typegoose/typegoose';
import { versionStringToVersionNumber } from '~/utils/version.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import type {
	AnySchemaClass,
	BaseSchemaExtends,
	MigrationSchemaExtends,
	NewSchemaOptions
} from '~/types/schema.js';
import type {
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchema
} from '~/types/hyperschema-module.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from '~/utils/migration-schema.js';
import createClone from 'rfdc';
import type { SchemaOptions } from 'mongoose';

const clone = createClone();

function getModelSchemaPropMapFromMigrationSchema({
	migrationSchema,
	schemaName,
	modelSchema
}: {
	migrationSchema: AnySchemaClass;
	schemaName: string;
	modelSchema: AnySchemaClass;
}): Map<string, unknown> {
	const modelSchemaPropMap = new Map();

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

	const currentMigrationSchemaPropMap =
		Reflect.getMetadata(DecoratorKeys.PropCache, migrationSchema.prototype) ??
		new Map();

	for (const [propKey, propValue] of currentMigrationSchemaPropMap.entries()) {
		modelSchemaPropMap.set(propKey, clone(propValue));
	}

	const currentMigrationSchemaOptions = migrationOptionMap.get(
		migrationSchemaVersion
	);

	if (migrationSchemaVersion === 0) {
		if (currentMigrationSchemaOptions?.from !== undefined) {
			const fromModelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
				migrationSchema: currentMigrationSchemaOptions.from,
				schemaName: currentMigrationSchemaOptions.from.name,
				modelSchema
			});

			for (const [propKey, propValue] of fromModelSchemaPropMap.entries()) {
				modelSchemaPropMap.set(propKey, clone(propValue));
			}
		}
	}

	const keysToOmit = new Set();

	for (const key of Object.keys(currentMigrationSchemaOptions?.omit ?? {})) {
		keysToOmit.add(key);
	}

	// Loop through the migration chain
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

		const currentMigrationSchemaOptions = migrationOptionMap.get(
			currentMigrationSchemaVersion
		);

		for (const [
			propKey,
			propValue
		] of currentMigrationSchemaPropMap.entries()) {
			if (keysToOmit.has(propKey)) {
				continue;
			}

			modelSchemaPropMap.set(propKey, clone(propValue));
		}

		for (const key of Object.keys(currentMigrationSchemaOptions?.omit ?? {})) {
			keysToOmit.add(key);
		}

		if (
			currentMigrationSchemaVersion === 0 &&
			currentMigrationSchemaOptions?.from !== undefined
		) {
			const fromModelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
				migrationSchema: currentMigrationSchemaOptions.from,
				schemaName,
				modelSchema
			});

			for (const [propKey, propValue] of fromModelSchemaPropMap.entries()) {
				if (keysToOmit.has(propKey)) {
					continue;
				}

				modelSchemaPropMap.set(propKey, clone(propValue));
			}
		}
	}

	for (const propValue of modelSchemaPropMap.values()) {
		(propValue as any).target = modelSchema.prototype;
	}

	return modelSchemaPropMap;
}

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
	Object.defineProperty(modelSchema, 'name', { value: schemaName });
	Object.defineProperty(modelSchema.prototype, '_v', {
		value: migrationSchema.prototype._v
	});

	const modelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
		migrationSchema,
		schemaName,
		modelSchema
	});

	Reflect.defineMetadata(
		DecoratorKeys.PropCache,
		modelSchemaPropMap,
		modelSchema.prototype
	);

	const migrationSchemaVersion = versionStringToVersionNumber(
		migrationSchema.prototype._v
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
