import {
  GetSchemaFromHyperschema,
  GetSchemaKeyFromHyperschema,
  NormalizeHyperschema,
} from "../types/hyperschema.js";
import { getModelWithString, pre } from "@typegoose/typegoose";
import { PreMiddlewareFunction, Query } from "mongoose";

export function normalizeHyperschema<Hyperschema>(
  hyperschema: Hyperschema
): NormalizeHyperschema<Hyperschema> {
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
  hyperschemas: Hyperschemas
): {
  [HyperschemaKey in keyof Hyperschemas as GetSchemaKeyFromHyperschema<
    Hyperschemas[HyperschemaKey]
  >]: {
    schema: GetSchemaFromHyperschema<Hyperschemas[HyperschemaKey]>;
    onForeignModelDeletedActions: any;
    migration: any;
    schemaName: string;
  };
} {
  const parentModelOnDeleteActions: {
    childModelName: string;
    childModelField: string;
    parentModelName: string;
    action: "Cascade" | "SetNull" | "Restrict";
  }[] = [];

  const schemaMap: Record<
    string,
    {
      schema: any;
      schemaName: string;
      onForeignModelDeletedActions: any;
      migration: any;
    }
  > = {};

  for (const [hyperschemaIdentifier, hyperschema] of Object.entries(
    hyperschemas
  )) {
    const schema = getSchemaFromHyperschema(hyperschema);
    const schemaKey = getSchemaKeyFromHyperschema(hyperschema);
    const migration = getMigrationFromHyperschema(hyperschema);
    const onForeignModelDeletedActions =
      getOnForeignModelDeletedActionsFromHyperschema(hyperschema);

    schemaMap[hyperschemaIdentifier] = {
      schema,
      schemaName: schemaKey,
      onForeignModelDeletedActions,
      migration,
    };
  }

  // Loop through each schema assuming they are the child model
  for (const [
    schemaName,
    // TODO: implement migrations
    { onForeignModelDeletedActions, schema },
  ] of Object.entries(schemaMap)) {
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
  for (const [schemaName, { schema }] of Object.entries(schemaMap)) {
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

    pre("deleteOne", preDeleteOne, { document: false, query: true })(schema);
    pre("findOneAndDelete", preDeleteOne, { document: false, query: true })(
      schema
    );
  }

  // Register a migration hook for all the hyperschemas
  for (const hyperschema of Object.values(hyperschemas)) {
    pre("validate", function () {})(hyperschema.schema);
  }

  return schemaMap as any;
}

function getMigrationKeyFromHyperschema(hyperschema: any): string {
  const migrationKey = Object.keys(hyperschema).find(
    (key) => key === "migration" || key.endsWith("_migration")
  );

  if (migrationKey === undefined) {
    throw new Error(
      `Could not find the "migration" key for hyperschema: ${JSON.stringify(
        hyperschema
      )}`
    );
  }

  return migrationKey;
}

function getMigrationFromHyperschema(hyperschema: any) {
  const migrationKey = getMigrationKeyFromHyperschema(hyperschema);

  const migration = hyperschema[migrationKey as keyof typeof hyperschema];

  return migration;
}

function getOnForeignModelDeletedActionsKeyFromHyperschema(
  hyperschema: any
): string {
  const onForeignModelDeletedActionsKey = Object.keys(hyperschema).find(
    (key) =>
      key === "onForeignModelDeletedActions" ||
      key.endsWith("_onForeignModelDeletedActions")
  );
  if (onForeignModelDeletedActionsKey === undefined) {
    throw new Error(
      `Could not find the "onForeignModelDeletedActions" key from "${JSON.stringify(
        hyperschema
      )}"`
    );
  }

  return onForeignModelDeletedActionsKey;
}

function getOnForeignModelDeletedActionsFromHyperschema(hyperschema: any) {
  const onForeignModelDeletedActionsKey =
    getOnForeignModelDeletedActionsKeyFromHyperschema(hyperschema);

  const onForeignModelDeletedActions =
    hyperschema[onForeignModelDeletedActionsKey as keyof typeof hyperschema];

  return onForeignModelDeletedActions;
}

function getSchemaKeyFromHyperschema(hyperschema: any): string {
  const migrationKey = getMigrationKeyFromHyperschema(hyperschema);
  const onForeignModelDeletedActionsKey =
    getOnForeignModelDeletedActionsKeyFromHyperschema(hyperschema);

  const schemaKey = Object.keys(hyperschema).find(
    (key) => key !== migrationKey && key !== onForeignModelDeletedActionsKey
  );
  if (schemaKey === undefined) {
    throw new Error(
      `Could not find the schema key in "${JSON.stringify(hyperschema)}"`
    );
  }

  return schemaKey;
}

function getSchemaFromHyperschema(hyperschema: any) {
  const schemaKey = getSchemaKeyFromHyperschema(hyperschema);

  const schema = hyperschema[schemaKey as keyof typeof hyperschema];

  return schema;
}
