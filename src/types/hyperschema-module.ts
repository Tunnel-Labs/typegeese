import type { SchemaOptions } from 'mongoose';
import type { MigrationData } from '~/types/migration.js';
import type { AnyRelations } from './relations.js';
import type { AnySchemaClass, BaseSchemaClass } from '~/types/schema.js';

// prettier-ignore
export type AnyUnnormalizedHyperschemaModule =
	& Record<`${string}_relations`, Record<string, string>>
	& Record<`${string}_migration`, MigrationData>
	& Record<`${string}_schemaOptions`, unknown>
	& Record<string, BaseSchemaClass>;

export type GetUnnormalizedHyperschemaModuleMigrationKey<
	H extends AnyUnnormalizedHyperschemaModule
> = Extract<keyof H, 'migration' | `${string}_migration`>;

export type GetUnnormalizedHyperschemaModuleRelationsKey<
	H extends AnyUnnormalizedHyperschemaModule
> = Extract<keyof H, 'relations' | `${string}_relations`>;

export type GetUnnormalizedHyperschemaModuleSchemaOptionsKey<
	H extends AnyUnnormalizedHyperschemaModule
> = Extract<keyof H, 'schemaOptions' | `${string}_schemaOptions`>;

export type GetUnnormalizedHyperschemaModuleMigrationSchemaKey<
	H extends AnyUnnormalizedHyperschemaModule
> = Exclude<
	keyof H,
	| 'migration'
	| 'relations'
	| 'schemaOptions'
	| `${string}_migration`
	| `${string}_relations`
	| `${string}_schemaOptions`
>;

export type GetUnnormalizedHyperschemaModuleMigration<
	H extends AnyUnnormalizedHyperschemaModule
> = GetUnnormalizedHyperschemaModuleMigrationKey<H> extends keyof H
	? H[GetUnnormalizedHyperschemaModuleMigrationKey<H>]
	: never;

export type GetUnnormalizedHyperschemaModuleRelations<
	H extends AnyUnnormalizedHyperschemaModule
> = GetUnnormalizedHyperschemaModuleMigrationKey<H> extends keyof H
	? H[GetUnnormalizedHyperschemaModuleMigrationKey<H>]
	: never;

export type GetUnnormalizedHyperschemaModuleSchemaOptions<
	H extends AnyUnnormalizedHyperschemaModule
> = GetUnnormalizedHyperschemaModuleSchemaOptionsKey<H> extends keyof H
	? H[GetUnnormalizedHyperschemaModuleSchemaOptionsKey<H>]
	: never;

export type GetUnnormalizedHyperschemaModuleMigrationSchema<
	H extends AnyUnnormalizedHyperschemaModule
> = GetUnnormalizedHyperschemaModuleMigrationSchemaKey<H> extends keyof H
	? H[GetUnnormalizedHyperschemaModuleMigrationSchemaKey<H>]
	: never;

export type NormalizeHyperschemaModule<
	H extends AnyUnnormalizedHyperschemaModule
> = {
	schemaName: string;
	migrationSchema: GetUnnormalizedHyperschemaModuleMigrationSchema<H>;
	migration: GetUnnormalizedHyperschemaModuleMigration<H>;
	relations: GetUnnormalizedHyperschemaModuleRelations<H>;
	schemaOptions?: GetUnnormalizedHyperschemaModuleSchemaOptions<H>;
};

export interface AnyNormalizedHyperschemaModule {
	schemaName: string;
	migrationSchema: AnySchemaClass;
	migration: MigrationData;
	relations: AnyRelations;
	schemaOptions?: SchemaOptions;
}
