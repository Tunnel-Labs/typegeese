import type { Schema } from "mongoose";
import { Promisable } from "type-fest";
import { MigrationData } from "~/types/migration.js";

export type GetSchemaKeyFromHyperschema<Hyperschema> = Exclude<
  Hyperschema,
  | "migration"
  | "onForeignModelDeletedActions"
  | `${string}_migration`
  | `${string}_onForeignModelDeletedActions`
>;

type GetMigrationKeyFromHyperschema<Hyperschema> =
  // @ts-expect-error: Works
  Pick<Hyperschema, "migration" | `${string}_migration`>;

export type GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> = Pick<
  Hyperschema,
  // @ts-expect-error: Works
  "onForeignModelDeletedActions" | `${string}_onForeignModelDeletedActions`
>;

export type GetSchemaFromHyperschema<Hyperschema> =
  GetSchemaKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetSchemaKeyFromHyperschema<Hyperschema>]
    : "Could not determine schema key from hyperschema";

export type GetMigrationFromHyperschema<Hyperschema> =
  GetMigrationKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetMigrationKeyFromHyperschema<Hyperschema>]
    : "Could not determine migration key from hyperschema";

export type GetOnForeignModelDeletedFromHyperschema<Hyperschema> =
  GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema>]
    : "Could not determine 'onForeignModelDeletedActions' key from hyperschema";

export type NormalizeHyperschema<Hyperschema> = {
  schema: GetSchemaFromHyperschema<Hyperschema>;
  migration: GetMigrationFromHyperschema<Hyperschema>;
  onForeignModelDeletedActions: GetOnForeignModelDeletedFromHyperschema<Hyperschema>;
};

export interface NormalizedHyperschema {
  schema: Schema;
  migration: MigrationData;
  onForeignModelDeletedActions: Record<string, () => Promisable<void>>;
}
