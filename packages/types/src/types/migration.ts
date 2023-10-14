import type * as mongoose from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { CreateType } from './create.js';
import type { IsVirtualForeignRef, IsVirtualForeignRefArray } from './ref.js';
import type { AnySchemaInstance } from './schema.js';

export type Diff<T, V> = {
	[P in Exclude<keyof T, keyof V>]: T[P];
};

// prettier-ignore
export type ExcludeVirtualForeignRefs<Model> = {
	[
		K in keyof Model as
			IsVirtualForeignRef<Model[K]> extends true ?
				never :
			IsVirtualForeignRefArray<Model[K]> extends true ?
				never :
			K extends '_migration' | 'prototype' ?
				never :
			K
	]: Model[K];
};

// prettier-ignore
export type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof ExcludeVirtualForeignRefs<CurrentModel>
> =
	Key extends '_v' | '__type__' | '_migration' ?
		true :
	Key extends keyof PreviousModel ?
		CurrentModel[Key] extends PreviousModel[Key] ?
			true :
		false :
	true;

export type NonSupersetKeys<PreviousModel, CurrentModel> = keyof {
	[K in keyof ExcludeVirtualForeignRefs<PreviousModel> as IsSupersetKey<
		PreviousModel,
		CurrentModel,
		// @ts-expect-error: works
		K
	> extends false
		? K
		: never]: true;
};

export interface NotSupersetError<Message, _Keys> {
	'Not a superset:': Message;
}

// prettier-ignore
export type MigrationValues<
	PreviousSchema extends AnySchemaInstance,
	CurrentSchema extends AnySchemaInstance
> = {
	[
		K in keyof Diff<
			ExcludeVirtualForeignRefs<CurrentSchema>,
			ExcludeVirtualForeignRefs<PreviousSchema>
		>
	]: CreateType<CurrentSchema[K]>;
}

export interface MigrationOptions {
	initialize?(args: {
		mongoose: mongoose.Mongoose;
		meta: any;
	}): Promisable<void>;
}

export type MigrationFunction<
	PreviousSchema extends AnySchemaInstance,
	CurrentSchema extends AnySchemaInstance
> = (
	properties: MigrationValues<PreviousSchema, CurrentSchema>
) => AnyMigrationReturn;

export type AnyMigrationFunction = (migrate: any) => AnyMigrationReturn;

export type AnyMigrationReturn = Promisable<{
	[migrateSymbol]: MigrateSymbolMessage;
} | null>;

interface A<B, C> extends MigrationValues<B, C> {}

export type Migrate<
	PreviousSchema extends AnySchemaInstance,
	CurrentSchema extends AnySchemaInstance
> = {
	(properties: A<PreviousSchema, CurrentSchema>): AnyMigrationReturn
	_id: string;
	mongoose: mongoose.Mongoose;
};

declare const migrateSymbol: /* unique symbol */ '__migrate__';
export type MigrateReturn<
	PreviousSchema extends AnySchemaInstance,
	CurrentSchema extends AnySchemaInstance
> = Promisable<
	| ({ [migrateSymbol]: MigrateSymbolMessage } & MigrationValues<
			PreviousSchema,
			CurrentSchema
	  >)
	| null
>;

export type MigrateSymbolMessage =
	'The `_migration` function must return `migrate({ ... })` or `null`';
