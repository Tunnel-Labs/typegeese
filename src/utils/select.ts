import { getModelWithString } from '@typegoose/typegoose';
import { includeKeys } from 'filter-obj';
import mapObject, { mapObjectSkip } from 'map-obj';
import { QueryWithHelpers } from 'mongoose';
import { IsManyQuery } from '~/types/query.js';
import { GetSchemaFromQuery } from '~/types/schema.js';
import { setProperty } from 'dot-prop';
import util from 'node:util';

import type { SelectInput, SelectOutput } from '~/types/select.js';

/**
	@example ```javascript
		select(
			UserModel.findById(userId),
			{
				_id: true,
				name: true,
				personalOrganization: {
					select: {
						_id: true,
						name: true
					}
				}
			}
		)
	```
*/
export async function select<
	Query extends QueryWithHelpers<any, any>,
	const Select extends SelectInput<GetSchemaFromQuery<Query>>
>(
	query: Query,
	topLevelSelect: Select
): Promise<
	IsManyQuery<Query> extends true
		? SelectOutput<GetSchemaFromQuery<Query>, Select>[]
		: SelectOutput<GetSchemaFromQuery<Query>, Select> | null
> {
	const topLevelFieldsToSelect = {
		...mapObject(topLevelSelect, (key) =>
			key !== '_count' ? ([key, 1] as [string, 1]) : mapObjectSkip
		),
		_id: true
	};

	query.select(mapObject(topLevelFieldsToSelect, (key) => [key, 1]));

	const topLevelFieldsToPopulate = includeKeys(
		topLevelSelect,
		(_key, value) => typeof value === 'object'
	);

	interface PopulateObject {
		path: string;
		select: any;
		populate?: any[];
	}

	/**
		We need to keep track of paths that have already been populated because mongoose doesn't work if we populate the same path twice in a single query
	*/
	const populatedPaths = new Set<string>();

	/**
		A list of queries to call again (for when we need to call populate on paths that have already been populated)
	*/
	const nestedQueries: Array<{ fullPath: string[]; select: any; model: any }> =
		[];

	const getPopulateObject = (
		model: any,
		path: string,
		fullPath: string[],
		queryInput: { select: any },
		modelForeignField?: string
	): PopulateObject => {
		const populate: PopulateObject[] = [];

		const select = mapObject(
			queryInput.select,
			(key) =>
				// The `foreignField` needs to be included in the projection for virtual populate to work
				[key, 1] as [string, 1]
		);

		const fieldsToPopulate = Object.entries(
			includeKeys(
				queryInput.select,
				(key, value) => key !== modelForeignField && typeof value === 'object'
			)
		);

		for (const [fieldPath, fieldQueryInput] of fieldsToPopulate) {
			const ref =
				model.schema.tree[fieldPath]?.options?.ref ??
				model.schema.tree[fieldPath]?.ref;

			if (ref === undefined) {
				throw new Error(
					`Could not determine \`ref\` for path "${fieldPath}" on model "${
						model.modelName as string
					}"`
				);
			}

			const fieldModel = getModelWithString(ref);
			const foreignField = (fieldModel?.schema as any).tree?.[path]?.options
				?.foreignField;

			// If the path has already been populated, we avoid populating it again in the same query
			if (populatedPaths.has(fieldPath)) {
				nestedQueries.push({
					fullPath: [...fullPath, fieldPath],
					select: fieldQueryInput.select,
					model: fieldModel
				});
			} else {
				populatedPaths.add(fieldPath);
				populate.push(
					getPopulateObject(
						fieldModel,
						fieldPath,
						[...fullPath, fieldPath],
						fieldQueryInput,
						foreignField
					)
				);
			}
		}

		return populate.length === 0
			? {
					path,
					select
			  }
			: {
					path,
					select,
					populate
			  };
	};

	const populateArray = [];
	for (const [path, queryInput] of Object.entries(topLevelFieldsToPopulate)) {
		const ref =
			// @ts-expect-error: exists at runtime
			query.model.schema.tree[path]?.options?.ref ??
			// @ts-expect-error: exists at runtime
			query.model.schema.tree[path]?.ref;

		if (ref === undefined) {
			throw new Error(
				`Could not determine \`ref\` for path "${path}" on model "${
					query.model.modelName as string
				}"`
			);
		}

		const fieldModel = getModelWithString(ref);
		// @ts-expect-error: exists at runtime
		const foreignField = query.model.schema.tree[path]?.options?.foreignField;

		populatedPaths.add(path);
		populateArray.push(
			getPopulateObject(
				fieldModel,
				path,
				[path],
				queryInput as any,
				foreignField
			)
		);
	}

	query.populate(populateArray);

	const document = await query.lean().exec();

	for (const { model, fullPath, select: selectInput } of nestedQueries) {
		// Retrieve all the IDs of the documents that need to be populated
		/**
			Map from the object path of the `result` object to the ID that needs to be replaced
		*/
		const idToNestedDocumentPath = new Map<
			string,
			Array<(string | number)[]>
		>();
		const getIdsFromPath = (
			document: any,
			remainingPathSegments: string[],
			fullPath: (string | number)[]
		) => {
			console.log('document', document, remainingPathSegments, fullPath);
			if (remainingPathSegments.length === 0) {
				if (typeof document !== 'string') {
					throw new Error('Expected nested document to be a string');
				}

				let nestedDocumentArray = idToNestedDocumentPath.get(document);
				if (nestedDocumentArray === undefined) {
					nestedDocumentArray = [];
					idToNestedDocumentPath.set(document, nestedDocumentArray);
				}
				nestedDocumentArray.push(fullPath);

				return;
			}

			const currentPathSegment = remainingPathSegments[0]!;
			const nestedDocument = document[currentPathSegment];

			if (Array.isArray(nestedDocument)) {
				for (const [
					nestedDocumentEntryIndex,
					nestedDocumentEntry
				] of nestedDocument.entries()) {
					getIdsFromPath(nestedDocumentEntry, remainingPathSegments.slice(1), [
						...fullPath,
						currentPathSegment,
						nestedDocumentEntryIndex
					]);
				}
			} else {
				getIdsFromPath(nestedDocument, remainingPathSegments.slice(1), [
					...fullPath,
					currentPathSegment
				]);
			}
		};
		getIdsFromPath(document, fullPath, []);

		const nestedDocumentIds = [...idToNestedDocumentPath.keys()];
		const nestedResult = await select(
			model.find({ _id: { $in: nestedDocumentIds } }),
			selectInput
		);

		for (const nestedResultEntry of nestedResult as any) {
			const nestedDocumentPaths = idToNestedDocumentPath.get(
				nestedResultEntry._id
			);
			for (const nestedDocumentPath of nestedDocumentPaths!) {
				let pathString = '';
				for (const [
					nestedDocumentPathSegmentIndex,
					nestedDocumentPathSegment
				] of nestedDocumentPath.entries()) {
					if (typeof nestedDocumentPathSegment === 'number') {
						pathString += `[${nestedDocumentPathSegment}]`;
					} else {
						pathString +=
							nestedDocumentPathSegmentIndex === 0
								? nestedDocumentPathSegment
								: `.${nestedDocumentPathSegment}`;
					}
				}
				(setProperty as any)(document, pathString, nestedResultEntry);
			}
		}
	}

	return document as any;
}
