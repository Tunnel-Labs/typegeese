import { DocumentType } from "@typegoose/typegoose";
import { MigrationData, MigrationFunctions } from "../types/migration.js";
import {
  GetSchemaFromHyperschema,
  NormalizeHyperschema,
  NormalizedHyperschema,
} from "../types/hyperschema.js";
import { getVersionFromSchema } from "~/utils/schema.js";
import { normalizeHyperschema } from "~/utils/hyperschema.js";
import { IsEqual } from "type-fest";
import { ModelSchema } from "../classes/index.js";

/**
	Applies the migrations of hyperschemas in order

	@param args
	@param args.newerHyperschema - The newer version of the hyperschema to migrate the document to
*/
export async function migrateDocument({
  hyperschema,
  document,
}: {
  document: DocumentType<{ _version: number }>;
  hyperschema: NormalizedHyperschema;
}) {
  const hyperschemaVersion = getVersionFromSchema(hyperschema.schema);
  const documentVersion = document._version;

  // If the hyperschema version is greater than the document version, then we should apply the previous hyperschema migration before the current one
  if (hyperschemaVersion > documentVersion) {
    migrateDocument({
      hyperschema: hyperschema.migration.previousHyperschema,
      document,
    });
  }

  // Applying the hyperschema's migrations
  for (const [property, getProperty] of Object.entries(
    hyperschema.migration.migrationFunctions
  )) {
    if ((document as any)[property] === undefined) {
      // eslint-disable-next-line no-await-in-loop -- We set properties one at a time to avoid race conditions
      (document as any)[property] = await getProperty.call(document);
    }
  }
}

export function defineMigration<
  PreviousHyperschema,
  CurrentSchema extends ModelSchema,
>(
  ...args: IsEqual<CurrentSchema["_version"], 0> extends true
    ? [previousHyperschema: null]
    : [
        previousHyperschema: PreviousHyperschema,
        migrationFunctions: MigrationFunctions<
          GetSchemaFromHyperschema<NormalizeHyperschema<PreviousHyperschema>>,
          CurrentSchema
        >,
      ]
): MigrationData {
  if (args[0] === null) {
    return {
      migrationFunctions: {},
      previousHyperschema: null!,
    };
  }

  const [previousHyperschema, migrationFunctions] = args;
  if (previousHyperschema === undefined) {
    throw new Error("The previous hyperschema must be provided");
  }

  if (migrationFunctions === undefined) {
    throw new Error("Migration functions must be provided");
  }
  const previousNormalizedHyperschema =
    normalizeHyperschema(previousHyperschema);

  return {
    previousHyperschema: previousNormalizedHyperschema as any,
    migrationFunctions: migrationFunctions as any,
  };
}
