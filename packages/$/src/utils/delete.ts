import type * as mongoose from 'mongoose';
import { AnyModelSchemaClass } from '@typegeese/types';
import { pre } from '@typegoose/typegoose';

import { DecoratorKeys } from './decorator-keys.js';
import { getModelForActiveSchema } from './model.js';
import { getRelationsFromModelSchema } from 'packages/$/src/utils/relations.js';

export function registerOnForeignModelDeletedHooks({
	modelSchemas
}: {
	modelSchemas: Record<string, AnyModelSchemaClass>;
}) {
	const parentModelOnDeleteActions: {
		childModelName: string;
		childModelField: string;
		parentModelName: string;
		action: 'Cascade' | 'SetNull' | 'Restrict';
	}[] = [];

	// Loop through each schema assuming they are the child model
	for (const modelSchema of Object.values(modelSchemas)) {
		const childModelName = modelSchema.name;

		const propMap =
			Reflect.getMetadata(DecoratorKeys.PropCache, modelSchema.prototype) ??
			new Map();

		const relations = getRelationsFromModelSchema(modelSchema);

		// For each foreign ref field, get the name of the parent model
		// We want to perform an action based on when the parent model is deleted
		for (const {
			foreignModelName: parentModelName,
			hostField: childModelField,
			onDelete
		} of relations) {
			parentModelOnDeleteActions.push({
				action: onDelete,
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
	for (const modelSchema of Object.values(modelSchemas)) {
		const parentModelName = modelSchema.name;
		const onModelDeletedActions =
			onParentModelDeletedActions[parentModelName] ?? [];

		const preDeleteOne: mongoose.PreMiddlewareFunction<
			mongoose.Query<any, any>
		> = function (next) {
			const parentModel = getModelForActiveSchema({
				schemaName: parentModelName
			});

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
									if (model === null) {
										return;
									}

									const childModel = getModelForActiveSchema({
										schemaName: childModelName
									});

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
			modelSchema
		);
		pre('findOneAndDelete', preDeleteOne, { document: false, query: true })(
			modelSchema
		);
	}
}
