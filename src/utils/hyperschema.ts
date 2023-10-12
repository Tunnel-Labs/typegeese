import type { Hyperschema } from '~/types/hyperschema.js';
import { pre, post, getModelForClass } from '@typegoose/typegoose';
import mapObject from 'map-obj';
import type { Mongoose } from 'mongoose';
import { createMigrateFunction } from '~/utils/migration.js';
import { recursivelyAddSelectVersionToPopulateObject } from '~/utils/populate.js';
import type { PopulateObject } from '~/types/populate.js';
import { registerOnForeignModelDeletedHooks } from '~/utils/delete.js';
import { getModelForHyperschema } from '~/utils/model.js';
import type {
	AnyNormalizedHyperschemaModule,
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchemaKey,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import { createModelSchemaFromMigrationSchema } from '~/utils/schema.js';

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

export async function createHyperschemas<
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

	// Register a migration hook for all the hyperschemas
	for (const hyperschema of Object.values(hyperschemas)) {
		const selectVersion = function (this: any) {
			this.select('_v');

			// We also have to make sure the `_v` key is selected in nested `populate` calls
			for (const populateObject of Object.values(
				this._mongooseOptions.populate ?? {}
			)) {
				recursivelyAddSelectVersionToPopulateObject(
					populateObject as PopulateObject
				);
			}
		};

		// Make sure that we always select the `_v` field (since we need this field in our migration hook)
		pre('find', selectVersion)(hyperschema.schema as any);
		pre('findOne', selectVersion)(hyperschema.schema as any);

		post('findOne', function (result, next) {
			migrate({
				mongoose,
				hyperschema,
				documents: Array.isArray(result) ? result : [result]
			})
				.then(() => next())
				.catch((error) => {
					console.error(
						`Typegeese migration failed for ${hyperschema.schemaName} v${result._v} document:`,
						error
					);
					next(error);
				});
		})(hyperschema.schema as any);
		post('find', function (result, next) {
			migrate({
				mongoose,
				hyperschema,
				documents: Array.isArray(result) ? result : [result]
			})
				.then(() => next())
				.catch((error) => {
					console.error(
						`Typegeese migration failed for ${hyperschema.schemaName} v${result._v} document:`,
						error
					);
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
		await migration.initialize?.({ mongoose, meta });
	}

	return {
		...hyperschemas,
		...mapObject(hyperschemas, (schemaName, hyperschema) => [
			`${schemaName}Model`,
			getModelForHyperschema(hyperschema, { mongoose })
		])
	} as any;
}
