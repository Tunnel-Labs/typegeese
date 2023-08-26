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

export type GetSchemaFromHyperschema<Hyperschema> =
  GetSchemaKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? // TODO: figure out why this is needed
      Exclude<Hyperschema[GetSchemaKeyFromHyperschema<Hyperschema>], string>
    : never;

export type GetMigrationFromHyperschema<Hyperschema> =
  GetMigrationKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetMigrationKeyFromHyperschema<Hyperschema>]
    : never;

export type GetOnForeignModelDeletedFromHyperschema<Hyperschema> =
  GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema> extends keyof Hyperschema
    ? Hyperschema[GetOnForeignModelDeletedKeyFromHyperschema<Hyperschema>]
    : never;

export type NormalizedHyperschema<Hyperschema> = {
  schema: GetSchemaFromHyperschema<Hyperschema>;
  migration: GetMigrationFromHyperschema<Hyperschema>;
  onForeignModelDeletedActions: GetOnForeignModelDeletedFromHyperschema<Hyperschema>;
  schemaName: string;
};
