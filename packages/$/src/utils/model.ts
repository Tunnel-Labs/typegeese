import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass,
	AnySchemaInstance
} from '@typegeese/types';
import { getModelForClass, getModelWithString } from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';

import { toVersionNumber } from './version.js';
import { getMigrationSchemasMap } from './migration-schema.js';
import { createModelSchemaFromMigrationSchema } from './schema.js';

export function getModelForActiveSchema({
	schemaName
}: {
	schemaName: string;
}): ReturnType<
	typeof getModelForClass<{
		new (): AnySchemaInstance;
	}>
> {
	const schemas = getMigrationSchemasMap();
	const migrationSchemaMap = schemas.get(schemaName);

	if (migrationSchemaMap === undefined) {
		throw new Error(`Could not find migration schema map for "${schemaName}"`);
	}

	const latestMigrationSchema = migrationSchemaMap.get(
		migrationSchemaMap.size - 1
	);

	if (latestMigrationSchema === undefined) {
		throw new Error(
			`Could not find latest migration schema for "${schemaName}"`
		);
	}

	const version = toVersionNumber(latestMigrationSchema._v);

	const model = getModelWithString(schemaName + '-' + version);
	if (model === undefined) {
		throw new Error(
			`Could not find model for active schema "${schemaName}" (version: ${version})`
		);
	}

	return model as any;
}

export function getModelForSchema<
	Schema extends AnyMigrationSchemaClass | AnyModelSchemaClass
>(
	schema: Schema,
	{ mongoose }: { mongoose: Mongoose }
): ReturnType<
	typeof getModelForClass<{
		new (): InstanceType<Schema>;
	}>
> {
	const version = toVersionNumber(schema._v);
	const modelSchema =
		'__isModelSchema' in schema
			? schema
			: createModelSchemaFromMigrationSchema(schema);

	const model = getModelForClass(modelSchema, {
		existingMongoose: mongoose,
		schemaOptions: {
			collection: schema.name
		},
		options: {
			customName: schema.name + '-' + version
		}
	});

	// @ts-expect-error
	return model;
}
