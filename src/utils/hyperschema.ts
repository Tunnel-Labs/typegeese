import {
  GetSchemaFromHyperschema,
  GetSchemaKeyFromHyperschema,
  NormalizedHyperschema,
} from "../types/hyperschema.js";
import { getModelWithString, pre } from "@typegoose/typegoose";
import mapObject from "map-obj";
import { PreMiddlewareFunction, Query } from "mongoose";

export function normalizeHyperschema<Hyperschema>(
  hyperschema: Hyperschema
): NormalizedHyperschema<Hyperschema> {
  if (typeof hyperschema === "object" && hyperschema !== null) {
    const migrationKey = Object.keys(hyperschema).find(
      (key) => key === "migration" || key.endsWith("_migration")
    );

    if (migrationKey === undefined) {
      throw new Error(
        `Missing "migration" key in hyperschema: ${JSON.stringify(hyperschema)}`
      );
    }

    const migration = hyperschema[migrationKey as keyof typeof hyperschema];

    const onForeignModelDeletedActionsKey = Object.keys(hyperschema).find(
      (key) =>
        key === "onForeignModelDeletedActions" ||
        key.endsWith("_onForeignModelDeletedActions")
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

    const schemaKey = Object.keys(hyperschema).find(
      (key) => key !== migrationKey && key !== onForeignModelDeletedActionsKey
    );
    if (schemaKey === undefined) {
      throw new Error(
        `Missing "schema" key in hyperschema: "${JSON.stringify(hyperschema)}}"`
      );
    }

    const schema = hyperschema[schemaKey as keyof typeof hyperschema];

    return {
      schema,
      migration,
      onForeignModelDeletedActions,
    } as any;
  } else {
    throw new Error(`Invalid hyperschema: ${hyperschema}`);
  }
}

export function loadHyperschemas<Hyperschemas extends Record<string, any>>(
  unnormalizedHyperschemas: Hyperschemas
): {
  [HyperschemaKey in keyof Hyperschemas as GetSchemaKeyFromHyperschema<
    Hyperschemas[HyperschemaKey]
  >]: NormalizedHyperschema<Hyperschemas[HyperschemaKey]>
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
    action: "Cascade" | "SetNull" | "Restrict";
  }[] = [];

  // Loop through each schema assuming they are the child model
  for (const // TODO: implement migrations
    {
      onForeignModelDeletedActions,
      schema,
      schemaName,
    } of Object.values(hyperschemas)) {
    const childModelName = schemaName;

    const propMap = Reflect.getOwnMetadata(
      "typegoose:properties",
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
        parentModelName,
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
      action: "Cascade" | "SetNull" | "Restrict";
    }[]
  > = {};

  for (const {
    childModelField,
    childModelName,
    parentModelName,
    action,
  } of parentModelOnDeleteActions) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Might be undefined
    onParentModelDeletedActions[parentModelName] ??= [];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Initialized above
    onParentModelDeletedActions[parentModelName]!.push({
      childModelName,
      childModelField,
      parentModelName,
      action,
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
      const parentModel = getModelWithString(parentModelName);
      if (parentModel === undefined) {
        throw new Error(
          `Typegeese model "${parentModelName}" has not been loaded`
        );
      }

      const isDeleteRestricted = onModelDeletedActions.some(
        ({ action }) => action === "Restrict"
      );

      if (isDeleteRestricted) {
        // We deliberately do not call `next` here because we want to prevent the deletion
        parentModel
          .findOne(this.getQuery(), { _id: 1 })
          .exec()
          .then((model) => {
            console.error(
              `Deleting "${parentModelName} ${
                model._id as string
              }" is restricted.`
            );
          })
          .catch((error) => {
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
                  const childModel = getModelWithString(childModelName);
                  if (childModel === undefined) {
                    throw new Error(
                      `Typegeese model "${childModelName}" has not been loaded`
                    );
                  }

                  if (action === "Cascade") {
                    await childModel.deleteMany({
                      [childModelField]: model._id,
                    });
                  } else if (action === "SetNull") {
                    await childModel.updateMany(
                      {
                        [childModelField]: model._id,
                      },
                      {
                        $set: {
                          [childModelField]: null,
                        },
                      }
                    );
                  }
                }
              )
            )
          )
          .then(() => next())
          .catch((error) => {
            console.error("Typegeese delete hook failed:", error);
          });
      }
    };

    pre("deleteOne", preDeleteOne, { document: false, query: true })(
      schema as any
    );
    pre("findOneAndDelete", preDeleteOne, { document: false, query: true })(
      schema as any
    );
  }

  // Register a migration hook for all the hyperschemas
  for (const { schema } of Object.values(hyperschemas)) {
    pre("validate", function () {})(schema as any);
  }

  return hyperschemas as any;
}
