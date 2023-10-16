import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass,
	AnySchemaInstance
} from '@typegeese/types';
import {
	pre,
	getModelForClass,
	getModelWithString
} from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';

import { toVersionNumber } from './version.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from './migration-schema.js';
import { createModelSchemaFromMigrationSchema } from './schema.js';
import { getPropMapKeysForActiveSchema } from './prop-map.js';

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
	if (model === undefined)
		throw new Error(
			`Could not find model for active schema "${schemaName}" (version: ${version})`
		);

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

	const migrationOptionsMap = getMigrationOptionsMap();
	const migrationOptionMap = migrationOptionsMap.get(modelSchema.name);
	const baseOptions = migrationOptionMap?.get(0);

	// If the collection was renamed using `from`, run the query in the old collection and copy all the result documents into the new collection before running the query on the new collection
	if (baseOptions?.from !== undefined) {
		const fromSchemaName = baseOptions.from.name;
		pre('findOne', async function (this: any, next) {
			const fromModel = getModelForActiveSchema({ schemaName: fromSchemaName });
			const propMapKeys = getPropMapKeysForActiveSchema({
				schemaName: fromSchemaName
			});

			const fullProjection = Object.fromEntries(
				propMapKeys.map((key) => [key, 1])
			);

			const oldDocument = await fromModel
				.findOne(this.getQuery(), fullProjection)
				.lean()
				.exec();

			if (oldDocument !== null) {
				const model = getModelForSchema(modelSchema, { mongoose });
				try {
					await model.collection.insertOne({
						...oldDocument,
						_v: 0
					} as any);
				} catch (error: any) {
					if (error.code !== 11000) {
						next(error);
						return;
					}
				}
			}

			next();
		})(modelSchema);
		pre('find', async function (this: any, next) {
			const fromModel = getModelForActiveSchema({ schemaName: fromSchemaName });
			const propMapKeys = getPropMapKeysForActiveSchema({
				schemaName: fromSchemaName
			});

			const fullProjection = Object.fromEntries(
				propMapKeys.map((key) => [key, 1])
			);

			const oldDocuments = await fromModel
				.find(this.getQuery(), fullProjection)
				.lean()
				.exec();

			if (oldDocuments.length > 0) {
				const model = getModelForSchema(modelSchema, { mongoose });
				try {
					await model.collection.insertMany(
						oldDocuments.map(
							(oldDocument) => ({ ...oldDocument, _v: 0 }) as any
						),
						{
							// This is needed to avoid erroring on documents with duplicate IDs
							ordered: false
						}
					);
				} catch (error: any) {
					if (error.code !== 11000) {
						next(error);
						return;
					}
				}
			}

			next();
		})(modelSchema);
	}

	const model =
		getModelWithString(schema.name + '-' + version) ??
		getModelForClass(modelSchema, {
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
