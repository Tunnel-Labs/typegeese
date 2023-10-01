import {
	GetSchemaKeyFromHyperschema,
	NormalizedHyperschema
} from '~/types/hyperschema.js';
import { pre, post, getModelForClass } from '@typegoose/typegoose';
import mapObject from 'map-obj';
import { Mongoose } from 'mongoose';
import { createMigrateFunction } from '~/utils/migration.js';
import { recursivelyAddSelectVersionToPopulateObject } from '~/utils/populate.js';
import { PopulateObject } from '~/types/populate.js';
import { registerOnForeignModelDeletedHooks } from '~/utils/delete.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import { getModelForHyperschema } from '~/index.js';
import createClone from 'rfdc';

const clone = createClone();

export function normalizeHyperschema<Hyperschema>(
	hyperschema: Hyperschema
): NormalizedHyperschema<Hyperschema> {
	if (
		hyperschema === null ||
		hyperschema === undefined ||
		(typeof hyperschema !== 'object' && typeof hyperschema !== 'function')
	) {
		throw new Error(`Invalid hyperschema: ${JSON.stringify(hyperschema)}`);
	}

	// If the `schemaName` property is present, the hyperschema is already normalized
	if ('schemaName' in hyperschema) {
		return hyperschema as any;
	}

	const migrationKey = Object.keys(hyperschema).find(
		(key) => key === 'migration' || key.endsWith('_migration')
	);

	if (migrationKey === undefined) {
		throw new Error(
			`Missing "migration" key in hyperschema: ${JSON.stringify(hyperschema)}`
		);
	}

	const migration = hyperschema[migrationKey as keyof typeof hyperschema];

	const onForeignModelDeletedActionsKey = Object.keys(hyperschema).find(
		(key) =>
			key === 'onForeignModelDeletedActions' ||
			key.endsWith('_onForeignModelDeletedActions')
	);
	if (onForeignModelDeletedActionsKey === undefined) {
		throw new Error(
			`Missing "onForeignModelDeletedActions" key in hyperschema: "${JSON.stringify(
				hyperschema
			)}"`
		);
	}

	const onForeignModelDeletedActions =
		hyperschema[onForeignModelDeletedActionsKey as keyof typeof hyperschema];

	const schemaOptionsKey =
		Object.keys(hyperschema).find(
			(key) => key === 'schemaOptions' || key.endsWith('_schemaOptions')
		) ?? 'schemaOptions';

	const schemaOptions =
		hyperschema[schemaOptionsKey as keyof typeof hyperschema] ?? {};

	const schemaKey = Object.keys(hyperschema).find(
		(key) =>
			key !== migrationKey &&
			key !== onForeignModelDeletedActionsKey &&
			key !== schemaOptionsKey
	);
	if (schemaKey === undefined) {
		throw new Error(
			`Missing "schema" key in hyperschema: "${JSON.stringify(hyperschema)}}"`
		);
	}

	const originalSchema = hyperschema[
		schemaKey as keyof typeof hyperschema
	] as any;

	let schema: any;
	if (originalSchema.__typegeeseSchema !== undefined) {
		schema = originalSchema.__typegeeseSchema;
	} else {
		const basePropMap = Reflect.getMetadata(
			DecoratorKeys.PropCache,
			originalSchema.prototype
		) as Map<string, { options?: { ref: string } }>;

		const prototypePropMap = Reflect.getMetadata(
			DecoratorKeys.PropCache,
			Object.getPrototypeOf(originalSchema).prototype
		) as Map<string, { options?: { ref: string } }>;

		const mergedPropMap = clone(
			new Map([...prototypePropMap.entries(), ...basePropMap.entries()])
		);

		const SchemaClass = class {};
		Object.defineProperty(SchemaClass, 'name', { value: originalSchema.name });
		for (const propValue of mergedPropMap.values()) {
			(propValue as any).target = SchemaClass.prototype;
		}

		Reflect.defineMetadata(
			DecoratorKeys.PropCache,
			mergedPropMap,
			SchemaClass.prototype
		);

		originalSchema.__typegeeseSchema = SchemaClass;
		schema = SchemaClass;
	}

	const normalizedHyperschema = {
		schema,
		schemaName: schemaKey,
		schemaOptions,
		migration,
		onForeignModelDeletedActions
	};

	return normalizedHyperschema as any;
}

export async function loadHyperschemas<
	Hyperschemas extends Record<string, any>
>(
	unnormalizedHyperschemas: Hyperschemas,
	{
		mongoose,
		meta
	}: {
		mongoose: Mongoose;
		meta?: any;
	}
): Promise<
	{
		[HyperschemaKey in keyof Hyperschemas as GetSchemaKeyFromHyperschema<
			Hyperschemas[HyperschemaKey]
		>]: NormalizedHyperschema<Hyperschemas[HyperschemaKey]>;
	} & {
		[HyperschemaKey in keyof Hyperschemas as `${GetSchemaKeyFromHyperschema<
			Hyperschemas[HyperschemaKey]
		> &
			string}Model`]: ReturnType<
			typeof getModelForHyperschema<Hyperschemas[HyperschemaKey]>
		>;
	}
> {
	const hyperschemas = mapObject(
		unnormalizedHyperschemas,
		(_key, unnormalizedHyperschema) => {
			const normalizedHyperschema = normalizeHyperschema(
				unnormalizedHyperschema
			);
			return [normalizedHyperschema.schemaName, normalizedHyperschema];
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
