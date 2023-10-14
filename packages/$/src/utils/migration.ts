import { getVersionFromSchema, isVersionedDocument } from '../utils/version.js';
import { DecoratorKeys } from '../utils/decorator-keys.js';
import type { Mongoose } from 'mongoose';
import type { AnyHyperschema } from '@typegeese/types';

import { getModelForActiveHyperschema } from '../utils/model.js';

function getForeignHyperschemaFromForeignPropertyKey({
	hyperschemas,
	hyperschema,
	foreignPropertyKey
}: {
	hyperschemas: Record<string, AnyHyperschema>;
	hyperschema: AnyHyperschema;
	foreignPropertyKey: string;
}): AnyHyperschema {
	const propMap =
		Reflect.getMetadata(
			DecoratorKeys.PropCache,
			hyperschema.schema.prototype
		) ?? new Map();

	const foreignSchemaName = propMap.get(foreignPropertyKey)?.options?.ref;

	if (foreignSchemaName === undefined) {
		throw new Error(
			`Could not find model name for property "${foreignPropertyKey}" on model "${hyperschema.schemaName}"`
		);
	}

	const foreignHyperschema = hyperschemas[foreignSchemaName];

	if (foreignHyperschema === undefined) {
		throw new Error(
			`Could not find hyperschema for model "${foreignSchemaName}"`
		);
	}

	return foreignHyperschema;
}

/**
	Applies the migrations of hyperschemas in order

	@param args
	@param args.result - The result returned from mongoose (the raw object; only updated if the projections include those results)
*/
export async function applyHyperschemaMigrationsToDocument({
	mongoose,
	meta,
	documentMetadata,
	hyperschema,
	updatedProperties
}: {
	mongoose: Mongoose;
	meta: any;
	documentMetadata: {
		_id: string;
		_v: number;
	};
	hyperschema: AnyHyperschema;
	updatedProperties: Record<string, unknown>;
}): Promise<{ updatedProperties: Record<string, unknown> }> {
	const hyperschemaVersion = getVersionFromSchema(hyperschema.schema);

	// If the hyperschema version is more than one greater than the document version, then we should apply the previous hyperschema migration before the current one
	if (hyperschemaVersion - 1 > documentMetadata._v) {
		await applyHyperschemaMigrationsToDocument({
			mongoose,
			meta,
			updatedProperties,
			hyperschema: hyperschema.migration.previousHyperschema,
			documentMetadata
		});
	}

	const data =
		hyperschema.migration === undefined ||
		hyperschema.migration.getData === null
			? null
			: await hyperschema.migration.getData.call(
					{ meta, mongoose },
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

export function createMigrateFunction({
	hyperschemas,
	meta
}: {
	hyperschemas: Record<string, AnyHyperschema>;
	meta: any;
}) {
	return async function migrate({
		mongoose,
		hyperschema,
		documents
	}: {
		mongoose: Mongoose;
		hyperschema: AnyHyperschema;
		documents: Array<{ _id: string; _v: number }>;
	}) {
		const documentIdToMigrationPromise = new Map<
			string,
			Promise<{ updatedProperties: Record<string, unknown> }>
		>();

		const migrateDocumentPromises: Promise<{
			updatedProperties: Record<string, unknown>;
		}>[] = [];

		for (let [documentIndex, document] of documents.entries()) {
			if (document === undefined || document === null) continue;

			if (document._id === undefined) {
				throw new Error('The `_id` field must be present');
			}

			if (document._v === undefined) {
				throw new Error('The `_v` field must be present');
			}

			if ('_doc' in document) {
				document = document._doc as any;
			}

			// We check to see if the result has any nested documents that need to be migrated
			for (const [propertyKey, propertyValue] of Object.entries(document)) {
				if (isVersionedDocument(propertyValue)) {
					const document = propertyValue as unknown as {
						_id: string;
						_v: number;
					};

					const foreignHyperschema =
						getForeignHyperschemaFromForeignPropertyKey({
							foreignPropertyKey: propertyKey,
							hyperschemas,
							hyperschema
						});

					await migrate({
						mongoose,
						hyperschema: foreignHyperschema,
						documents: [document]
					});
				} else if (Array.isArray(propertyValue)) {
					const versionedDocuments = propertyValue.filter((value) =>
						isVersionedDocument(value)
					);

					if (versionedDocuments.length > 0) {
						const foreignHyperschema =
							getForeignHyperschemaFromForeignPropertyKey({
								foreignPropertyKey: propertyKey,
								hyperschemas,
								hyperschema
							});

						await migrate({
							mongoose,
							hyperschema: foreignHyperschema,
							documents: versionedDocuments
						});
					}
				}
			}

			if (document._v !== getVersionFromSchema(hyperschema.schema)) {
				if (documentIdToMigrationPromise.has(document._id)) {
					// Prevents an infinite loop with this migration hook
					continue;
				} else {
					const migrationPromise = applyHyperschemaMigrationsToDocument({
						mongoose,
						meta,
						documentMetadata: {
							_id: document._id,
							_v: document._v
						},
						hyperschema,
						/**
								Keeps track of the all the properties that have been updated so we can update the result array with them (if they have been selected).
							*/
						updatedProperties: {}
					});

					documentIdToMigrationPromise.set(document._id, migrationPromise);
					migrateDocumentPromises[Number(documentIndex)] = migrationPromise;
				}
			}
		}

		if (migrateDocumentPromises.length === 0) {
			return;
		} else {
			const migrateDocumentResults = await Promise.all(migrateDocumentPromises);

			await Promise.all(
				migrateDocumentResults.map(
					async (migrateDocumentResult, documentIndex) => {
						if (migrateDocumentResult === undefined) return;

						const result = documents[documentIndex];
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

						const hyperschemaModel = getModelForActiveHyperschema({
							schemaName: hyperschema.schemaName
						});

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
						result._v = getVersionFromSchema(hyperschema.schema);
					}
				)
			);
		}
	};
}