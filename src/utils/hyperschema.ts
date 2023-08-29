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
import mapObject from 'map-obj';
import { Mongoose, PreMiddlewareFunction, Query } from 'mongoose';
import { applyHyperschemaMigrationsToDocument } from '~/utils/migration.js';
import { getVersionFromSchema } from '~/utils/version.js';
import { recursivelyAddSelectVersionToPopulateObject } from '~/utils/populate.js';
import { PopulateObject } from '~/types/populate.js';

function createMigrateFunction({
	hyperschemas,
	meta
}: {
	hyperschemas: Record<string, NormalizedHyperschema<any>>;
	meta: any;
}) {
	return async function migrate({
		hyperschema,
		result
	}: {
		hyperschema: NormalizedHyperschema<any>;
		result: { _id: string; _v: number } | Array<{ _id: string; _v: number }>;
	}) {
		const documentIdToMigrationPromise = new Map<
			string,
			Promise<{ updatedProperties: Record<string, unknown> }>
		>();
		const resultArray: Record<number, { _id: string; _v: number }> =
			Array.isArray(result) ? result : [result];
		const migrateDocumentPromises: Promise<{
			updatedProperties: Record<string, unknown>;
		}>[] = [];

		for (let [resultArrayIndex, result] of Object.entries(resultArray)) {
			if (result === undefined || result === null) continue;

			if (result._id === undefined) {
				throw new Error('The `_id` field must be present');
			}

			if (result._v === undefined) {
				throw new Error('The `_v` field must be present');
			}

			if ('_doc' in result) {
				result = result._doc as any;
			}

			// We check to see if the result has any nested documents that need to be migrated
			for (const [propertyKey, propertyValue] of Object.entries(result)) {
				if (
					typeof propertyValue === 'object' &&
					propertyValue !== null &&
					'_v' in propertyValue
				) {
					const nestedModelName =
						hyperschema.schema.paths[propertyKey]?.options?.ref;

					if (nestedModelName === undefined) {
						throw new Error(
							`Could not find model name for property "${propertyKey}" on model "${nestedModelName}"`
						);
					}

					const nestedHyperschema = hyperschemas[nestedModelName];

					if (nestedHyperschema === undefined) {
						throw new Error(
							`Could not find hyperschema for model "${nestedModelName}"`
						);
					}

					await migrate({
						hyperschema: nestedHyperschema,
						result: propertyValue as any
					});
				}
			}

			if (result._v !== getVersionFromSchema(hyperschema.schema)) {
				if (documentIdToMigrationPromise.has(result._id)) {
					// Prevents an infinite loop with this migration hook
					continue;
				} else {
					const migrationPromise = applyHyperschemaMigrationsToDocument({
						meta,
						documentMetadata: {
							_id: result._id,
							_v: result._v
						},
						hyperschema,
						/**
								Keeps track of the all the properties that have been updated so we can update the result array with them (if they have been selected).
							*/
						updatedProperties: {}
					});

					documentIdToMigrationPromise.set(result._id, migrationPromise);
					migrateDocumentPromises[Number(resultArrayIndex)] = migrationPromise;
				}
			}
		}

		if (migrateDocumentPromises.length === 0) {
			return;
		} else {
			const migrateDocumentResults = await Promise.all(migrateDocumentPromises);

			await Promise.all(
				migrateDocumentResults.map(
					async (migrateDocumentResult, resultArrayIndex) => {
						if (migrateDocumentResult === undefined) return;

						const result = resultArray[resultArrayIndex];
						// TODO: this should error
						if (result === undefined) return;

						const { updatedProperties } = migrateDocumentResult;

						for (const [propertyKey, propertyValue] of Object.entries(
							updatedProperties
						)) {
							// TODO: only add the property to the result if it has been included in the projection
							// if (this._userProvidedFields[propertyKey]) {
							(result as any)[propertyKey] = propertyValue;
							// }
						}

						const hyperschemaModel = getModelWithString(
							hyperschema.schemaName
						)!;
						// Update the documents in MongoDB
						await hyperschemaModel.findOneAndUpdate(
							{
								_id: result._id,
								// We explicitly specify `_v` here in case the document has already been migrated by another process
								_v: result._v
							},
							{
								$set: {
									...updatedProperties,
									_v: getVersionFromSchema(hyperschema.schema)
								}
							}
						);

						documentIdToMigrationPromise.delete(result._id);
					}
				)
			);
		}
	};
}

export function normalizeHyperschema<Hyperschema>(
	hyperschema: Hyperschema
): NormalizedHyperschema<Hyperschema> {
	if (typeof hyperschema === 'object' && hyperschema !== null) {
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

	const parentModelOnDeleteActions: {
		childModelName: string;
		childModelField: string;
		parentModelName: string;
		action: 'Cascade' | 'SetNull' | 'Restrict';
	}[] = [];

	// Loop through each schema assuming they are the child model
	for (const // TODO: implement migrations
		{
			onForeignModelDeletedActions,
			schema,
			schemaName
		} of Object.values(hyperschemas)) {
		const childModelName = schemaName;

		const propMap = Reflect.getOwnMetadata(
			'typegoose:properties',
			schema.prototype
		);

		for (const [childModelField, action] of Object.entries(
			onForeignModelDeletedActions
		)) {
			// For each foreign ref field, get the name of the parent model
			// We want to perform an action based on when the parent model is deleted
			const parentModelName = propMap.get(childModelField).options?.ref;

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
			migrate({ hyperschema, result })
				.then(() => next())
				.catch((error) => next(error));
		})(hyperschema.schema as any);
		post('find', function (result, next) {
			migrate({ hyperschema, result })
				.then(() => next())
				.catch((error) => next(error));
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
