import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass
} from '@typegeese/types';
import { models, type Mongoose } from 'mongoose';

import {
	getVersionFromMigrationSchema,
	isVersionedDocument
} from './version.js';
import { DecoratorKeys } from './decorator-keys.js';

import { getModelForActiveSchema } from './model.js';
import {
	getLatestMigrationSchemaForModelSchema,
	getPreviousMigrationSchema
} from './schema.js';

function getForeignSchemaFromForeignPropertyKey({
	modelSchemas,
	modelSchema,
	foreignPropertyKey
}: {
	modelSchemas: Record<string, AnyModelSchemaClass>;
	modelSchema: AnyModelSchemaClass;
	foreignPropertyKey: string;
}): AnyModelSchemaClass {
	const propMap =
		Reflect.getMetadata(DecoratorKeys.PropCache, modelSchema.prototype) ??
		new Map();

	const foreignSchemaName = propMap.get(foreignPropertyKey)?.options?.ref;

	if (foreignSchemaName === undefined) {
		throw new Error(
			`Could not find model name for property "${foreignPropertyKey}" on model "${modelSchema.name}"`
		);
	}

	const foreignModelSchema = modelSchemas[foreignSchemaName];

	if (foreignModelSchema === undefined) {
		throw new Error(`Could not find schema for model "${foreignSchemaName}"`);
	}

	return foreignModelSchema;
}

/**
	Applies the migrations of a model schema's migrations in order

	@param args
	@param args.result - The result returned from mongoose (the raw object; only updated if the projections include those results)
*/
export async function applySchemaMigrationsToDocument({
	mongoose,
	meta,
	documentMetadata,
	migrationSchema,
	updatedProperties
}: {
	mongoose: Mongoose;
	meta: any;
	documentMetadata: {
		_id: string;
		_v: number;
	};
	migrationSchema: AnyMigrationSchemaClass;
	updatedProperties: Record<string, unknown>;
}): Promise<{ updatedProperties: Record<string, unknown> }> {
	const schemaVersion = getVersionFromMigrationSchema(migrationSchema);

	// If the schema version is more than one greater than the document version, then we should apply the previous schema migration before the current one
	if (schemaVersion - 1 > documentMetadata._v) {
		await applySchemaMigrationsToDocument({
			mongoose,
			meta,
			updatedProperties,
			migrationSchema: getPreviousMigrationSchema(migrationSchema)!,
			documentMetadata
		});
	}

	if (migrationSchema._migration !== undefined) {
		const migrationValues = await migrationSchema._migration({
			_id: documentMetadata._id,
			mongoose,
			meta
		});

		if (migrationValues !== null) {
			// Applying the schema's migrations
			for (const [key, value] of Object.entries(migrationValues)) {
				updatedProperties[key] = value;
			}
		}
	}

	return { updatedProperties };
}

export function createMigrateFunction({
	modelSchemas,
	meta
}: {
	modelSchemas: Record<string, AnyModelSchemaClass>;
	meta: any;
}) {
	return async function migrate({
		mongoose,
		modelSchema,
		documents
	}: {
		mongoose: Mongoose;
		modelSchema: AnyModelSchemaClass;
		documents: Array<{ _id: string; _v: number }>;
	}) {
		const latestMigrationSchema =
			getLatestMigrationSchemaForModelSchema(modelSchema);

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

					const foreignSchema = getForeignSchemaFromForeignPropertyKey({
						foreignPropertyKey: propertyKey,
						modelSchemas,
						modelSchema
					});

					await migrate({
						mongoose,
						modelSchema: foreignSchema,
						documents: [document]
					});
				} else if (Array.isArray(propertyValue)) {
					const versionedDocuments = propertyValue.filter((value) =>
						isVersionedDocument(value)
					);

					if (versionedDocuments.length > 0) {
						const foreignSchema = getForeignSchemaFromForeignPropertyKey({
							foreignPropertyKey: propertyKey,
							modelSchemas,
							modelSchema
						});

						await migrate({
							mongoose,
							modelSchema: foreignSchema,
							documents: versionedDocuments
						});
					}
				}
			}

			if (
				document._v !== getVersionFromMigrationSchema(latestMigrationSchema)
			) {
				if (documentIdToMigrationPromise.has(document._id)) {
					// Prevents an infinite loop with this migration hook
					continue;
				} else {
					const migrationPromise = applySchemaMigrationsToDocument({
						mongoose,
						meta,
						documentMetadata: {
							_id: document._id,
							_v: document._v
						},
						migrationSchema: latestMigrationSchema,
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

						const schemaModel = getModelForActiveSchema({
							schemaName: modelSchema.name
						});

						// Update the documents in MongoDB
						await schemaModel.findOneAndUpdate(
							{
								_id: result._id,
								// We explicitly specify `_v` here in case the document has already been migrated by another process
								_v: result._v
							},
							{
								$set: {
									...updatedProperties,
									_v: getVersionFromMigrationSchema(latestMigrationSchema)
								}
							}
						);

						documentIdToMigrationPromise.delete(result._id);
						result._v = getVersionFromMigrationSchema(latestMigrationSchema);
					}
				)
			);
		}
	};
}
