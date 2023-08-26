import type { SchemaOptions } from "mongoose";

export type GetSchemaKeyFromHyperschema<Hyperschema> = Exclude<
  keyof Hyperschema,
  | "migration"
  | "onForeignModelDeletedActions"
  | "schemaOptions"
  | `${string}_migration`
  | `${string}_onForeignModelDeletedActions`
  | `${string}_schemaOptions`
>;

export type GetSchemaFromHyperschema<Hyperschema> =
  GetSchemaKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? InstanceType<
        // @ts-expect-error: Works
        Hyperschema[GetSchemaKeyFromHyperschema<Hyperschema>]
      >
    : never;

export type GetMigrationKeyFromHyperschema<Hyperschema> = Extract<
  keyof Hyperschema,
  "migration" | `${string}_migration`
>;

export type GetMigrationFromHyperschema<Hyperschema> =
  GetMigrationKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetMigrationKeyFromHyperschema<Hyperschema>]
    : never;

export type GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> = Extract<
  keyof Hyperschema,
  "onForeignModelDeletedActions" | `${string}_onForeignModelDeletedActions`
>;

export type GetOnForeignModelDeletedFromHyperschema<Hyperschema> =
  GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema>]
    : never;

export type GetSchemaOptionsKeyFromHyperschema<Hyperschema> = Extract<
  keyof Hyperschema,
  "schemaOptions" | `${string}_schemaOptions`
>;

export type GetSchemaOptionsFromHyperschema<Hyperschema> =
  GetSchemaOptionsKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetSchemaOptionsKeyFromHyperschema<Hyperschema>]
    : never;

export type NormalizedHyperschema<Hyperschema> = {
  schema: GetSchemaFromHyperschema<Hyperschema>;
  migration: GetMigrationFromHyperschema<Hyperschema>;
  onForeignModelDeletedActions: GetOnForeignModelDeletedFromHyperschema<Hyperschema>;
  // Doesn't need to be strongly typed
  schemaOptions?: SchemaOptions;
  schemaName: string;
};
