import { prop } from '@typegoose/typegoose';
import type { SchemaOptions } from 'mongoose';

import type {
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchema
} from '~/types/hyperschema-module.js';
import type {
	AnySchemaClass,
	BaseSchemaExtends,
	MigrationSchemaExtends,
	NewSchemaOptions
} from '~/types/schema.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from '~/utils/migration-schema.js';
import { getModelSchemaPropMapFromMigrationSchema } from '~/utils/prop-map.js';
import { versionStringToVersionNumber } from '~/utils/version.js';

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
	if ('__modelSchema' in migrationSchema) {
		return migrationSchema.__modelSchema as AnySchemaClass;
	}

	// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Needed
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

	const migrationSchemasMap = getMigrationSchemasMap();
	let migrationSchemaMap = migrationSchemasMap.get(schemaName);
	if (migrationSchemaMap === undefined) {
		migrationSchemaMap = new Map();
		migrationSchemasMap.set(schemaName, migrationSchemaMap);
	}

	migrationSchemaMap.set(migrationSchemaVersion, migrationSchema);

	Object.defineProperty(migrationSchema, '__modelSchema', {
		value: modelSchema,
		enumerable: false
	});

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
