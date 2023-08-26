import type { Schema } from "mongoose";
import { Promisable } from "type-fest";
import { MigrationData } from "~/types/migration.js";

export type GetSchemaKeyFromHyperschema<Hyperschema> = Exclude<
  keyof Hyperschema,
  | "migration"
  | "onForeignModelDeletedActions"
  | `${string}_migration`
  | `${string}_onForeignModelDeletedActions`
>;

export type GetMigrationKeyFromHyperschema<Hyperschema> = Extract<
  keyof Hyperschema,
  "migration" | `${string}_migration`
>;

export type GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> = Extract<
  keyof Hyperschema,
  "onForeignModelDeletedActions" | `${string}_onForeignModelDeletedActions`
>;

export type InstanceTypeOrSelf<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : T;

export type GetSchemaFromHyperschema<Hyperschema> =
  GetSchemaKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? // @ts-expect-error: idk why this works but `InstanceType` doesn't
      InstanceTypeOrSelf<Hyperschema[GetSchemaKeyFromHyperschema<Hyperschema>]>
    : "Could not determine schema key from hyperschema";

export type GetMigrationFromHyperschema<Hyperschema> =
  GetMigrationKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetMigrationKeyFromHyperschema<Hyperschema>]
    : "Could not determine migration key from hyperschema";

export type GetOnForeignModelDeletedFromHyperschema<Hyperschema> =
  GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema>]
    : "Could not determine 'onForeignModelDeletedActions' key from hyperschema";

export type NormalizedHyperschema<Hyperschema> = {
  schema: GetSchemaFromHyperschema<Hyperschema>;
  migration: GetMigrationFromHyperschema<Hyperschema>;
  onForeignModelDeletedActions: GetOnForeignModelDeletedFromHyperschema<Hyperschema>;
  schemaName: string;
};
