import { getModelForClass, getModelWithString } from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';
import { toVersionNumber } from '../utils/version.js';
import { getMigrationSchemasMap } from '../utils/migration-schema.js';
import { createModelSchemaFromMigrationSchema } from '../utils/schema.js';
import type { AnySchemaClass, AnySchemaInstance } from '../../../types/src/types/schema.js';

export function getModelForActiveHyperschema({
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

	const modelSchema = createModelSchemaFromMigrationSchema({
		migrationSchema: latestMigrationSchema,
		schemaName
	});

	const version = toVersionNumber(modelSchema._v);

	const model = getModelWithString(schemaName + '-' + version);
	if (model === undefined) {
		throw new Error(
			`Could not find model for active hyperschema "${schemaName}" (version: ${version})`
		);
	}

	return model as any;
}

export function getModelForSchema<Schema extends AnySchemaClass>(
	schema: Schema,
	{ mongoose }: { mongoose: Mongoose }
): ReturnType<
	typeof getModelForClass<{
		new (): InstanceType<Schema>;
	}>
> {
	const version = toVersionNumber(schema._v);

	const model = getModelForClass(schema, {
		existingMongoose: mongoose,
		schemaOptions: {
			collection: schema.name
		},
		options: {
			customName: schema.name + '-' + version
		}
	});

	return model as any;
}
