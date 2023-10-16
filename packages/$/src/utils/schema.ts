import { getModelForClass, post, pre, prop } from '@typegoose/typegoose';
import mapObject from 'map-obj';
import type * as mongoose from 'mongoose';

import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass,
	BaseSchemaExtends,
	MigrationSchemaExtends,
	NewSchemaOptions,
	PopulateObject
} from '@typegeese/types';
import { DecoratorKeys } from './decorator-keys.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from './migration-schema.js';
import {
	getModelSchemaPropMapFromMigrationSchema,
	getPropMapKeysForActiveSchema
} from './prop-map.js';
import { getVersionFromMigrationSchema, toVersionNumber } from './version.js';
import { registerOnForeignModelDeletedHooks } from './delete.js';
import { createMigrateFunction } from './migration.js';
import { recursivelyAddSelectVersionToPopulateObject } from './populate.js';
import { getModelForActiveSchema, getModelForSchema } from './model.js';

/**
	Dynamically creates a full schema by going up the migration chain from a specified migration schema.
*/
export function createModelSchemaFromMigrationSchema(
	migrationSchema: AnyMigrationSchemaClass
): AnyModelSchemaClass {
	if ('__modelSchema' in migrationSchema) {
		return migrationSchema.__modelSchema as AnyModelSchemaClass;
	}

	// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Needed
	const modelSchema = class {} as AnyModelSchemaClass;
	Object.defineProperty(modelSchema, 'name', { value: migrationSchema.name });
	Object.defineProperty(modelSchema, '_v', {
		value: migrationSchema._v
	});
	Object.defineProperty(modelSchema, '__isModelSchema', { value: true });

	if (migrationSchema._initialize !== undefined) {
		Object.defineProperty(modelSchema, '_initialize', {
			value: migrationSchema._initialize
		});
	}

	const modelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
		migrationSchema,
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
	let migrationSchemaMap = migrationSchemasMap.get(modelSchema.name);
	if (migrationSchemaMap === undefined) {
		migrationSchemaMap = new Map();
		migrationSchemasMap.set(modelSchema.name, migrationSchemaMap);
	}

	migrationSchemaMap.set(migrationSchemaVersion, migrationSchema);

	Object.defineProperty(migrationSchema, '__modelSchema', {
		value: modelSchema,
		enumerable: false
	});

	return modelSchema;
}

export function defineSchemaOptions(schemaOptions: mongoose.SchemaOptions) {
	return schemaOptions;
}

export function getPreviousMigrationSchema(
	migrationSchema: AnyMigrationSchemaClass
): AnyMigrationSchemaClass | null {
	const migrationSchemasMap = getMigrationSchemasMap();
	const previousMigrationSchemaVersion =
		getVersionFromMigrationSchema(migrationSchema) - 1;
	return (
		migrationSchemasMap
			.get(migrationSchema.name)
			?.get(previousMigrationSchemaVersion) ?? null
	);
}

/**
	Instead of inheriting from the previous schema migration class at runtime,
	we instead create a copy of the class (this makes it easier to use discriminator types)
*/
export function Schema<
	SchemaName extends string,
	Options extends NewSchemaOptions
>(name: SchemaName, options?: Options): BaseSchemaExtends<SchemaName, Options>;
export function Schema<
	PreviousSchema extends AnyMigrationSchemaClass,
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
		const previousSchema = previousSchemaOrSchemaName;

		let migrationSchemaMap = migrationSchemasMap.get(previousSchema.name);
		if (migrationSchemaMap === undefined) {
			migrationSchemaMap = new Map();
			migrationSchemasMap.set(previousSchema.name, migrationSchemaMap);
		}

		let migrationOptionMap = migrationOptionsMap.get(previousSchema.name);
		if (migrationOptionMap === undefined) {
			migrationOptionMap = new Map();
			migrationOptionsMap.set(previousSchema.name, migrationOptionMap);
		}

		const previousVersionString = previousSchema._v;
		const previousVersionNumber = toVersionNumber(previousVersionString);

		migrationSchemaMap.set(previousVersionNumber, previousSchema);

		const currentVersionNumber = previousVersionNumber + 1;
		migrationOptionMap.set(currentVersionNumber, options);
	}

	// We return the `Object` constructor (which is basically equivalent to a no-op `extends` clause)
	// to avoid schema inheritance that might conflict with typegoose
	return Object;
}

/**
	Should only be called with the latest migration schemas
*/
export async function loadModelSchemas<
	Schemas extends Record<string, AnyMigrationSchemaClass>
>(
	latestMigrationSchemas: Schemas,
	{
		mongoose,
		meta
	}: {
		mongoose: mongoose.Mongoose;
		meta?: any;
	}
): Promise<
	{
		[SchemaKey in Exclude<keyof Schemas, `_${string}`>]: Schemas[SchemaKey];
	} & {
		// prettier-ignore
		[SchemaKey in Exclude<keyof Schemas, `_${string}`> as `${SchemaKey & string}Model`]: ReturnType<
			typeof getModelForSchema<Schemas[SchemaKey]>
		>;
	}
> {
	const modelSchemas = mapObject(
		latestMigrationSchemas,
		(_key, latestMigrationSchema) => {
			const modelSchema = createModelSchemaFromMigrationSchema(
				latestMigrationSchema
			);

			return [modelSchema.name, modelSchema];
		}
	);

	const migrationOptionsMap = getMigrationOptionsMap();
	const renamedSchemaNames = new Set<string>();
	for (const modelSchema of Object.values(modelSchemas)) {
		const migrationOptionMap = migrationOptionsMap.get(modelSchema.name);
		const baseOptions = migrationOptionMap?.get(0);
		if (baseOptions?.from !== undefined) {
			renamedSchemaNames.add(baseOptions.from.name);
		}
	}

	registerOnForeignModelDeletedHooks({ modelSchemas, renamedSchemaNames });

	const migrate = createMigrateFunction({ modelSchemas, meta });

	// Register a migration hook for all the model schemas
	for (const modelSchema of Object.values(modelSchemas)) {
		const migrationOptionMap = migrationOptionsMap.get(modelSchema.name);
		const baseOptions = migrationOptionMap?.get(0);

		// Make sure that we always select the `_v` field (since we need this field in our migration hook)
		pre('find', function (this: any, next) {
			(async () => {
				this.select('_v');

				// We also have to make sure the `_v` key is selected in nested `populate` calls
				for (const populateObject of Object.values(
					this._mongooseOptions.populate ?? {}
				)) {
					recursivelyAddSelectVersionToPopulateObject(
						populateObject as PopulateObject
					);
				}

				// If the collection was renamed using `from`, run the query in the old collection and copy all the result documents into the new collection (before re-running the query on the new collection)
				if (baseOptions?.from !== undefined) {
					const schemaName = baseOptions.from.name;

					const fromModel = getModelForActiveSchema({ schemaName });
					const propMapKeys = getPropMapKeysForActiveSchema({
						schemaName
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
				}

				next();
			})().catch((error) => {
				console.error('Unexpected error in pre find hook:', error);
				next(error);
			});
		})(modelSchema);
		pre('findOne', function (this: any, next) {
			(async () => {
				this.select('_v');

				// We also have to make sure the `_v` key is selected in nested `populate` calls
				for (const populateObject of Object.values(
					this._mongooseOptions.populate ?? {}
				)) {
					recursivelyAddSelectVersionToPopulateObject(
						populateObject as PopulateObject
					);
				}

				// If the collection was renamed using `from`, run the query in the old collection and copy all the result documents into the new collection (before re-running the query on the new collection)
				if (baseOptions?.from !== undefined) {
					const schemaName = baseOptions.from.name;

					const fromModel = getModelForActiveSchema({ schemaName });
					const propMapKeys = getPropMapKeysForActiveSchema({
						schemaName
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
				}

				next();
			})().catch((error) => {
				console.error('Unexpected error in pre findOne hook:', error);
				next(error);
			});
		})(modelSchema);

		post('findOne', function (result, next) {
			(async () => {
				if (result === null && baseOptions?.from !== undefined) {
				}

				try {
					await migrate({
						mongoose,
						modelSchema,
						documents: [result]
					});
					next();
				} catch (error: any) {
					console.error(
						`Typegeese migration failed for ${modelSchema.name} document:`,
						error
					);
					next(error);
				}
			})().catch((error) => {
				console.error('Unexpected error in post findOne hook:', error);
				next(error);
			});
		})(modelSchema);
		post('find', function (results, next) {
			(async () => {
				try {
					await migrate({
						mongoose,
						modelSchema,
						documents: results
					});
					next();
				} catch (error: any) {
					console.error(
						`Typegeese migration failed for ${modelSchema.name} document:`,
						error
					);
					next(error);
				}
			})().catch((error) => {
				console.error('Unexpected error in post find hook:', error);
				next(error);
			});
		})(modelSchema);
	}

	// Register the models for each schema (this is intentionally done after processing all the schemas so that all the hooks have been registered by now)
	for (const modelSchema of Object.values(modelSchemas)) {
		// TODO: figure out why removing this code causes mongoose to error with "MissingSchemaError: Schema hasn't been registered for model \"TunnelInstance\""
		// (likely due to some code trying to load the unsuffixed version of the model somewhere)
		getModelForClass(modelSchema, {
			existingMongoose: mongoose,
			schemaOptions: {
				collection: modelSchema.name
			}
		});

		getModelForSchema(modelSchema, { mongoose });
	}

	// Run any migration initialization functions
	for (const modelSchema of Object.values(modelSchemas)) {
		// skip the initialization functions of schemas which have been renamed
		if (renamedSchemaNames.has(modelSchema.name)) {
			continue;
		}

		if (modelSchema._initialize !== undefined) {
			await modelSchema._initialize({ mongoose, meta });
		}
	}

	return {
		...modelSchemas,
		...mapObject(modelSchemas, (_key, modelSchema) => [
			`${modelSchema.name}Model`,
			getModelForSchema(modelSchema, { mongoose })
		])
	} as any;
}
