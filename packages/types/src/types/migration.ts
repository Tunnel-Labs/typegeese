import type * as mongoose from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { CreateType } from './create.js';
import type { IsVirtualForeignRef, IsVirtualForeignRefArray } from './ref.js';
import type { AnyHyperschema } from './hyperschema.js';
import { AnySchemaInstance } from './schema.js';

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
export type MigrationValues<PreviousSchema, CurrentSchema> = {
	[
		K in keyof Diff<
			ExcludeVirtualForeignRefs<CurrentSchema>,
			ExcludeVirtualForeignRefs<PreviousSchema>
		>
	]: CreateType<CurrentSchema[K]>;
}

export interface MigrationData {
	previousHyperschema: AnyHyperschema;
	migrationFunctions: Record<string, (this: DocumentType<any>) => void>;
	getData:
		| null
		| ((this: { meta: any }, args: { _id: any }) => Promisable<any>);
	initialize?(args: {
		mongoose: mongoose.Mongoose;
		meta: any;
	}): Promisable<void>;
}

export interface MigrationOptions {
	initialize?(args: {
		mongoose: mongoose.Mongoose;
		meta: any;
	}): Promisable<void>;
}

export type Migrate<
	PreviousSchema extends AnySchemaInstance,
	CurrentSchema extends AnySchemaInstance
> = {
	_id: string;
	mongoose: mongoose.Mongoose;
	(
		properties: MigrationValues<PreviousSchema, CurrentSchema>
	): MigrateReturn<PreviousSchema, CurrentSchema>;
};

declare const migrateSymbol: /* unique symbol */ '__migrate__';
export type MigrateReturn<PreviousSchema, CurrentSchema> = Promisable<{
	readonly [migrateSymbol]: Promisable<
		{ [migrateSymbol]: MigrateSymbolMessage } & MigrationValues<
			PreviousSchema,
			CurrentSchema
		>
	>;
} | null>;

export type MigrateSymbolMessage =
	'The return type of `_migration` must be either be null or a call to `migrate({ ... })`';
