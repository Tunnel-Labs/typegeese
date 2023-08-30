import { MigrationData, MigrationFunctions } from '~/types/migration.js';
import { NormalizedHyperschema } from '~/types/hyperschema.js';
import { getVersionFromSchema } from '~/utils/version.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { IsEqual, Promisable } from 'type-fest';
import { getModelWithString } from '@typegoose/typegoose';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import { AnySchema } from '~/types/schema.js';

/**
	Applies the migrations of hyperschemas in order

	@param args
	@param args.result - The result returned from mongoose (the raw object; only updated if the projections include those results)
*/
export async function applyHyperschemaMigrationsToDocument({
	meta,
	documentMetadata,
	hyperschema,
	updatedProperties
}: {
	meta: any;
	documentMetadata: {
		_id: string;
		_v: number;
	};
	hyperschema: NormalizedHyperschema<any>;
	updatedProperties: Record<string, unknown>;
}): Promise<{ updatedProperties: Record<string, unknown> }> {
	const hyperschemaVersion = getVersionFromSchema(hyperschema.schema);

	// If the hyperschema version is more than one greater than the document version, then we should apply the previous hyperschema migration before the current one
	if (hyperschemaVersion > documentMetadata._v) {
		applyHyperschemaMigrationsToDocument({
			meta,
			updatedProperties,
			hyperschema: hyperschema.migration.previousHyperschema,
			documentMetadata
		});
	}

	const data = await hyperschema.migration.getData.call(
		{ meta },
		{ _id: documentMetadata._id }
	);

	if (data !== null) {
		// Applying the hyperschema's migrations
		for (const [property, getProperty] of Object.entries(
			hyperschema.migration.migrationFunctions
		)) {
			const value = await (getProperty as any).call(data);
			updatedProperties[property] = value;
		}
	}

	return { updatedProperties };
}

export function createMigration<CurrentSchema extends AnySchema>(
	...args: IsEqual<CurrentSchema['_v'], 0> extends true ? [null] : []
): IsEqual<CurrentSchema['_v'], 0> extends true
	? MigrationData
	: {
			from: <PreviousHyperschema>(previousHyperschema: PreviousHyperschema) => {
				with: <DataType>(
					getData: (
						this: { meta: any },
						args: { _id: string }
					) => Promisable<DataType>
				) => {
					migrate(
						migrationFunctions: MigrationFunctions<
							NormalizedHyperschema<PreviousHyperschema>['schema'],
							CurrentSchema,
							NonNullable<DataType>
						>
					): MigrationData;
				};
			};
	  } {
	if (args[0] === null) {
		return {
			getData() {},
			migrationFunctions: {},
			previousHyperschema: null!
		} as any;
	}

	return {
		from: (previousHyperschema: any) => ({
			with: (getData: any) => ({
				migrate: (migrationFunctions: any) => ({
					getData,
					migrationFunctions,
					previousHyperschema: normalizeHyperschema(previousHyperschema)
				})
			})
		})
	} as any;
}

export function createMigrateFunction({
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
		const resultArray: Array<AnySchema> = Array.isArray(result)
			? result
			: [result];

		const migrateDocumentPromises: Promise<{
			updatedProperties: Record<string, unknown>;
		}>[] = [];

		for (let [resultArrayIndex, result] of resultArray.entries()) {
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
					const propMap = Reflect.getOwnMetadata(
						DecoratorKeys.PropCache,
						hyperschema.schema.prototype
					);

					const nestedModelName = propMap.get(propertyKey)?.options?.ref;

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
