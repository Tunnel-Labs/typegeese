import { prop } from '@typegoose/typegoose';
import type { SchemaOptions } from 'mongoose';

import type {
	AnySchemaClass,
	BaseSchemaExtends,
	MigrationSchemaExtends,
	NewSchemaOptions
} from '@typegeese/types';
import { DecoratorKeys } from '../utils/decorator-keys.js';
import { normalizeHyperschemaModule } from '../utils/hyperschema-module.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from '../utils/migration-schema.js';
import { getModelSchemaPropMapFromMigrationSchema } from '../utils/prop-map.js';
import { toVersionNumber } from '../utils/version.js';

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
	Object.defineProperty(modelSchema, '_v', {
		value: migrationSchema._v
	});

	const modelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
		migrationSchema,
		schemaName,
		updateTarget: {
			modelSchema
		}
	});

	Reflect.defineMetadata(
		DecoratorKeys.PropCache,
		modelSchemaPropMap,
		modelSchema.prototype
	);

	const migrationSchemaVersion = toVersionNumber(migrationSchema._v);

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
	PreviousSchema extends AnySchemaClass,
	Options extends {
		omit: {
			[K in keyof InstanceType<PreviousSchema>]?: true;
		};
	}
>(
	previousSchema: PreviousSchema,
	options?: Options
): MigrationSchemaExtends<PreviousSchema, Options>;
export function Schema(
	previousSchemaOrSchemaName?: any,
	options?: {
		omit: Record<string, true>;
	}
): any {
	const migrationSchemasMap = getMigrationSchemasMap();
	const migrationOptionsMap = getMigrationOptionsMap();

	if (typeof previousSchemaOrSchemaName === 'string') {
		const schemaName = previousSchemaOrSchemaName;
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

		const previousVersionString = previousHyperschemaModule.migrationSchema._v;
		const previousVersionNumber = toVersionNumber(previousVersionString);

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
