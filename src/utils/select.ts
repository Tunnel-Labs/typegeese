import { getModelWithString } from '@typegoose/typegoose';
import { includeKeys } from 'filter-obj';
import mapObject, { mapObjectSkip } from 'map-obj';
import { QueryWithHelpers } from 'mongoose';
import { GetSchemaFromQuery } from '~/types/schema.js';

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
): Promise<SelectOutput<GetSchemaFromQuery<Query>, Select>> {
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

	const getPopulateObject = (
		model: any,
		path: string,
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

			populate.push(
				getPopulateObject(fieldModel, fieldPath, fieldQueryInput, foreignField)
			);
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

		populateArray.push(
			getPopulateObject(fieldModel, path, queryInput as any, foreignField)
		);
	}

	query.populate(populateArray);

	const result = await query.lean().exec();
	return result as any;
}
