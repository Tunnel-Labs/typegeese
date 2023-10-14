import type { PreMiddlewareFunction, Query } from 'mongoose';
import { pre } from '@typegoose/typegoose';
import { DecoratorKeys } from '../utils/decorator-keys.js';
import type { Hyperschema } from '../../../types/src/types/hyperschema.js';
import { getModelForActiveHyperschema } from '../utils/model.js';

export function registerOnForeignModelDeletedHooks({
	hyperschemas
}: {
	hyperschemas: Record<string, Hyperschema<any>>;
}) {
	const parentModelOnDeleteActions: {
		childModelName: string;
		childModelField: string;
		parentModelName: string;
		action: 'Cascade' | 'SetNull' | 'Restrict';
	}[] = [];

	// Loop through each schema assuming they are the child model
	for (const { relations, schema, schemaName } of Object.values(hyperschemas)) {
		const childModelName = schemaName;

		const propMap =
			Reflect.getMetadata(DecoratorKeys.PropCache, schema.prototype) ??
			new Map();

		for (const [childModelField, action] of Object.entries(relations)) {
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
			const parentModel = getModelForActiveHyperschema({
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

									const childModel = getModelForActiveHyperschema({
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
			schema as any
		);
		pre('findOneAndDelete', preDeleteOne, { document: false, query: true })(
			schema as any
		);
	}
}
