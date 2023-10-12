import type { Hyperschema } from '~/types/hyperschema.js';
import { pre, post, getModelForClass } from '@typegoose/typegoose';
import mapObject from 'map-obj';
import type { Mongoose } from 'mongoose';
import { createMigrateFunction } from '~/utils/migration.js';
import { recursivelyAddSelectVersionToPopulateObject } from '~/utils/populate.js';
import type { PopulateObject } from '~/types/populate.js';
import { registerOnForeignModelDeletedHooks } from '~/utils/delete.js';
import {
	getModelForActiveHyperschema,
	getModelForHyperschema
} from '~/utils/model.js';
import type {
	AnyNormalizedHyperschemaModule,
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchemaKey,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import { createModelSchemaFromMigrationSchema } from '~/utils/schema.js';
import { getMigrationOptionsMap } from '~/utils/migration-schema.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import { getPropMapKeysForActiveHyperschema } from '~/utils/prop-map.js';

export function createHyperschema<H extends AnyNormalizedHyperschemaModule>(
	hyperschemaModule: H
): Hyperschema<H> {
	const { migration, migrationSchema, relations, schemaName, schemaOptions } =
		hyperschemaModule;

	const normalizedHyperschema = {
		schema: createModelSchemaFromMigrationSchema({
			schemaName,
			migrationSchema
		}),
		schemaName,
		schemaOptions,
		migration,
		relations
	};

	return normalizedHyperschema;
}

/**
	Should only be called with the hyperschemas that represent the latest version of each collection.
*/
export async function registerActiveHyperschemas<
	UnnormalizedHyperschemaModules extends Record<
		string,
		AnyUnnormalizedHyperschemaModule
	>
>(
	unnormalizedHyperschemaModules: UnnormalizedHyperschemaModules,
	{
		mongoose,
		meta
	}: {
		mongoose: Mongoose;
		meta?: any;
	}
): Promise<
	{
		[HyperschemaKey in keyof UnnormalizedHyperschemaModules as GetUnnormalizedHyperschemaModuleMigrationSchemaKey<
			UnnormalizedHyperschemaModules[HyperschemaKey]
		>]: Hyperschema<
			NormalizeHyperschemaModule<UnnormalizedHyperschemaModules[HyperschemaKey]>
		>;
	} & {
		// prettier-ignore
		[HyperschemaKey in keyof UnnormalizedHyperschemaModules as `${GetUnnormalizedHyperschemaModuleMigrationSchemaKey<
			UnnormalizedHyperschemaModules[HyperschemaKey]
		> & string}Model`]: ReturnType<
			typeof getModelForHyperschema<
				UnnormalizedHyperschemaModules[HyperschemaKey]
			>
		>;
	}
> {
	const hyperschemas = mapObject(
		unnormalizedHyperschemaModules,
		(_key, unnormalizedHyperschema) => {
			const normalizedHyperschemaModule = normalizeHyperschemaModule(
				unnormalizedHyperschema
			);
			const hyperschema = createHyperschema(normalizedHyperschemaModule as any);
			return [hyperschema.schemaName, hyperschema];
		}
	);

	registerOnForeignModelDeletedHooks({ hyperschemas });

	const migrate = createMigrateFunction({ hyperschemas, meta });

	// Register a migration hook for all the active hyperschemas
	for (const hyperschema of Object.values(hyperschemas)) {
		const migrationOptionsMap = getMigrationOptionsMap();
		const migrationOptionMap = migrationOptionsMap.get(hyperschema.schemaName);
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

					const fromModel = getModelForActiveHyperschema({
						schemaName
					});

					const propMapKeys = getPropMapKeysForActiveHyperschema({
						schemaName
					});

					const fullProjection = Object.fromEntries(
						propMapKeys.map((key) => [key, 1])
					);

					console.log(fullProjection);

					const oldDocuments = await fromModel
						.find(this.getQuery(), fullProjection)
						.exec();

					console.log(oldDocuments);

					const model = getModelForHyperschema(hyperschema, { mongoose });
					await model.create(oldDocuments);
				}

				next();
			})().catch((error) => {
				console.error('Unexpected error in pre find hook:', error);
				next(error);
			});
		})(hyperschema.schema as any);
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

					const fromModel = getModelForActiveHyperschema({
						schemaName
					});

					const propMapKeys = getPropMapKeysForActiveHyperschema({
						schemaName
					});

					const fullProjection = Object.fromEntries(
						propMapKeys.map((key) => [key, 1])
					);

					const oldDocument = await fromModel
						.findOne(this.getQuery(), fullProjection)
						.exec();

					if (oldDocument !== null) {
						const model = getModelForHyperschema(hyperschema, { mongoose });
						await model.create(oldDocument);
					}
				}

				next();
			})().catch((error) => {
				console.error('Unexpected error in pre findOne hook:', error);
				next(error);
			});
		})(hyperschema.schema as any);

		post('findOne', function (result, next) {
			(async () => {
				if (result === null && baseOptions?.from !== undefined) {
				}

				try {
					await migrate({
						mongoose,
						hyperschema,
						documents: [result]
					});
					next();
				} catch (error: any) {
					console.error(
						`Typegeese migration failed for ${hyperschema.schemaName} document:`,
						error
					);
					next(error);
				}
			})().catch((error) => {
				console.error('Unexpected error in post findOne hook:', error);
				next(error);
			});
		})(hyperschema.schema as any);
		post('find', function (results, next) {
			(async () => {
				try {
					await migrate({
						mongoose,
						hyperschema,
						documents: results
					});
					next();
				} catch (error: any) {
					console.error(
						`Typegeese migration failed for ${hyperschema.schemaName} document:`,
						error
					);
					next(error);
				}
			})().catch((error) => {
				console.error('Unexpected error in post find hook:', error);
				next(error);
			});
		})(hyperschema.schema as any);
	}

	// Register the models for each schema (this is intentionally done after processing all the schemas so that all the hooks have been registered by now)
	for (const { schema, schemaName } of Object.values(hyperschemas)) {
		getModelForClass(schema, {
			existingMongoose: mongoose,
			schemaOptions: {
				collection: schemaName
			}
		});
	}

	// Run any migration initialization functions
	for (const { migration } of Object.values(hyperschemas)) {
		if (migration !== undefined) {
			await migration.initialize?.({ mongoose, meta });
		}
	}

	return {
		...hyperschemas,
		...mapObject(hyperschemas, (schemaName, hyperschema) => [
			`${schemaName}Model`,
			getModelForHyperschema(hyperschema, { mongoose })
		])
	} as any;
}
