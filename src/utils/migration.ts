import { getModelWithString } from "@typegoose/typegoose";
import { MigrationConfig, MigrationData } from "~/types/migration.js";
import { NormalizedHyperschema } from "~/types/hyperschema.js";
import { getVersionFromSchema } from "~/utils/version.js";
import { normalizeHyperschema } from "~/utils/hyperschema.js";
import { IsEqual } from "type-fest";
import { ModelSchema } from "~/classes/index.js";

/**
	Applies the migrations of hyperschemas in order

	@param args
	@param args.result - The result returned from mongoose (the raw object; only updated if the projections include those results)
*/
export async function applyHyperschemaMigrationsToDocument({
  meta,
  documentVersion,
  hyperschema,
  updatedProperties,
}: {
  meta: any;
  documentVersion: number;
  hyperschema: NormalizedHyperschema<any>;
  updatedProperties: Record<string, unknown>;
}) {
  const hyperschemaVersion = getVersionFromSchema(hyperschema.schema);

  // If the hyperschema version is greater than the document version, then we should apply the previous hyperschema migration before the current one
  if (hyperschemaVersion > documentVersion) {
    applyHyperschemaMigrationsToDocument({
      meta,
      updatedProperties,
      hyperschema: hyperschema.migration.previousHyperschema,
      documentVersion,
    });
  }

  const document = hyperschema.migration.migrationFunctions.call({
    Model: getModelWithString(hyperschema.schemaName),
  });

  // Applying the hyperschema's migrations
  for (const [property, getProperty] of Object.entries(
    hyperschema.migration.migrationFunctions
  )) {
    const value = await (getProperty as any).call({ _id: document._id });
    updatedProperties[property] = value;
  }
}

export function defineMigration<
  PreviousHyperschema,
  CurrentSchema extends ModelSchema,
>(
  ...args: IsEqual<CurrentSchema["__version"], 0> extends true
    ? [previousHyperschema: null]
    : [
        previousHyperschema: PreviousHyperschema,
        migrationConfig: MigrationConfig<
          // @ts-expect-error: is assignable
          NormalizedHyperschema<PreviousHyperschema>["schema"],
          CurrentSchema
        >,
      ]
): MigrationData {
  if (args[0] === null) {
    return {
      async getDocument() {},
      migrationFunctions: {},
      previousHyperschema: null!,
    };
  }

  const [previousHyperschema, migrationConfig] = args;
  if (previousHyperschema === undefined) {
    throw new Error("The previous hyperschema must be provided");
  }

  if (migrationConfig === undefined) {
    throw new Error("Migration configuration must be provided");
  }

  const previousNormalizedHyperschema =
    normalizeHyperschema(previousHyperschema);

  return {
    getDocument: migrationConfig.getDocument,
    previousHyperschema: previousNormalizedHyperschema as any,
    migrationFunctions: migrationConfig.migrations as any,
  };
}
