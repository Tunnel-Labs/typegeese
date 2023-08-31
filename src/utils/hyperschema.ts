import {
	GetSchemaKeyFromHyperschema,
	NormalizedHyperschema
} from '~/types/hyperschema.js';
import {
	getModelWithString,
	pre,
	post,
	getModelForClass
} from '@typegoose/typegoose';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import mapObject from 'map-obj';
import { Mongoose, PreMiddlewareFunction, Query } from 'mongoose';
import { createMigrateFunction } from '~/utils/migration.js';
import { recursivelyAddSelectVersionToPopulateObject } from '~/utils/populate.js';
import { PopulateObject } from '~/types/populate.js';
import { BaseSchema } from '~/index.js';

export function normalizeHyperschema<Hyperschema>(
	hyperschema: Hyperschema
): NormalizedHyperschema<Hyperschema> {
	if (typeof hyperschema === 'object' && hyperschema !== null) {
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

		const schema = hyperschema[schemaKey as keyof typeof hyperschema];

		return {
			schema,
			schemaName: schemaKey,
			schemaOptions,
			migration,
			onForeignModelDeletedActions
		} as any;
	} else {
		throw new Error(`Invalid hyperschema: ${hyperschema}`);
	}
}

export function loadHyperschemas<Hyperschemas extends Record<string, any>>(
	unnormalizedHyperschemas: Hyperschemas,
	{
		mongoose,
		meta
	}: {
		mongoose: Mongoose;
		meta?: any;
	}
): {
	[HyperschemaKey in keyof Hyperschemas as GetSchemaKeyFromHyperschema<
		Hyperschemas[HyperschemaKey]
	>]: NormalizedHyperschema<Hyperschemas[HyperschemaKey]>;
} {
	const hyperschemas = mapObject(
		unnormalizedHyperschemas,
		(_key, unnormalizedHyperschema) => {
			const normalizedHyperschema = normalizeHyperschema(
				unnormalizedHyperschema
			);
			return [normalizedHyperschema.schemaName, normalizedHyperschema];
		}
	);

	// For each schema, we need to merge all the typegoose metadata into the leaf schema
	for (const hyperschema of Object.values(hyperschemas)) {
		const mergedMetadata: Record<DecoratorKeys, Map<string, any>> = mapObject(
			DecoratorKeys,
			(_, decoratorKey) => [decoratorKey, new Map()]
		);

		const schemaPrototypeChain = [];
		let currentSchema = hyperschema.schema;

		while (currentSchema !== BaseSchema) {
			schemaPrototypeChain.push(currentSchema);
			currentSchema = Object.getPrototypeOf(currentSchema);
		}

		schemaPrototypeChain.push(currentSchema);

		// Loop through the prototype chain backwards
		// For each schema, we overwrite its metadata with our merged metadata map up to that point
		for (const schema of schemaPrototypeChain.reverse()) {
			for (const decoratorKey of Object.values(DecoratorKeys)) {
				const metadataMap = Reflect.getOwnMetadata(
					decoratorKey,
					schema.prototype
				) as Map<string, unknown> | undefined;

				if (metadataMap === undefined) continue;

				for (const [key, value] of metadataMap.entries()) {
					mergedMetadata[decoratorKey as DecoratorKeys].set(key, value);
				}
			}

			for (const [decoratorKey, metadataMap] of Object.entries(
				mergedMetadata
			)) {
				Reflect.defineMetadata(
					decoratorKey,
					new Map(metadataMap),
					schema.prototype
				);
			}
		}
	}

	const parentModelOnDeleteActions: {
		childModelName: string;
		childModelField: string;
		parentModelName: string;
		action: 'Cascade' | 'SetNull' | 'Restrict';
	}[] = [];

	// Loop through each schema assuming they are the child model
	for (const {
		onForeignModelDeletedActions,
		schema,
		schemaName
	} of Object.values(hyperschemas)) {
		const childModelName = schemaName;

		const propMap = Reflect.getOwnMetadata(
			DecoratorKeys.PropCache,
			schema.prototype
		) as Map<string, { options?: { ref: string } }>;

		for (const [childModelField, action] of Object.entries(
			onForeignModelDeletedActions
		)) {
			// For each foreign ref field, get the name of the parent model
			// We want to perform an action based on when the parent model is deleted
			const parentModelName = propMap.get(childModelField)?.options?.ref;

			if (parentModelName === undefined) {
				throw new Error(
					`Could not get the foreign model for field "${childModelField}" on "${childModelName}"`
				);
			}

			parentModelOnDeleteActions.push({
				action: action as any,
				childModelName,
				childModelField,
				parentModelName
			});
		}
	}

	// In order to determine the functions that should be run when a certain model is deleted,
	// we need to transform the `parentModelOnDeleteActions` array into a map from child models
	// to the delete actions.
	const onParentModelDeletedActions: Record<
		string,
		{
			childModelName: string;
			childModelField: string;
			parentModelName: string;
			action: 'Cascade' | 'SetNull' | 'Restrict';
		}[]
	> = {};

	for (const {
		childModelField,
		childModelName,
		parentModelName,
		action
	} of parentModelOnDeleteActions) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Might be undefined
		onParentModelDeletedActions[parentModelName] ??= [];

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Initialized above
		onParentModelDeletedActions[parentModelName]!.push({
			childModelName,
			childModelField,
			parentModelName,
			action
		});
	}

	// We loop through all schemas a second time and this time, assume they are the parent model being deleted
	for (const { schema, schemaName } of Object.values(hyperschemas)) {
		const parentModelName = schemaName;
		const onModelDeletedActions =
			onParentModelDeletedActions[parentModelName] ?? [];

		const preDeleteOne: PreMiddlewareFunction<Query<any, any>> = function (
			next
		) {
			const parentModel = getModelWithString(parentModelName)!;
			const isDeleteRestricted = onModelDeletedActions.some(
				({ action }) => action === 'Restrict'
			);

			if (isDeleteRestricted) {
				// We deliberately do not call `next` here because we want to prevent the deletion
				parentModel
					.findOne(this.getQuery(), { _id: 1 })
					.exec()
					.then((model: any) => {
						console.error(
							`Deleting "${parentModelName} ${
								model._id as string
							}" is restricted.`
						);
					})
					.catch((error: any) => {
						console.error(error);
					});
			} else {
				parentModel
					.findOne(this.getQuery(), { _id: 1 })
					.exec()
					.then(async (model) =>
						// Delete every child dependency first
						Promise.all(
							onModelDeletedActions.map(
								async ({ action, childModelName, childModelField }) => {
									const childModel = getModelWithString(childModelName)!;
									if (action === 'Cascade') {
										await childModel.deleteMany({
											[childModelField]: model._id
										});
									} else if (action === 'SetNull') {
										await childModel.updateMany(
											{
												[childModelField]: model._id
											},
											{
												$set: {
													[childModelField]: null
												}
											}
										);
									}
								}
							)
						)
					)
					.then(() => next())
					.catch((error) => {
						console.error('Typegeese delete hook failed:', error);
					});
			}
		};

		pre('deleteOne', preDeleteOne, { document: false, query: true })(
			schema as any
		);
		pre('findOneAndDelete', preDeleteOne, { document: false, query: true })(
			schema as any
		);
	}

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

	return hyperschemas as any;
}
