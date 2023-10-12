import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { CreateType } from '~/types/create.js';
import type {
	IsVirtualForeignRef,
	IsVirtualForeignRefArray
} from '~/types/ref.js';
import type { Mongoose } from 'mongoose';
import type { AnyHyperschema } from '~/types/hyperschema.js';

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
			K extends '__migration__' ?
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
	Key extends '_v' | '__type__' | '__migration__' ?
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
export type MigrationFunctions<PreviousSchema, CurrentSchema, DataType> = {
	[
		K in keyof Diff<
			ExcludeVirtualForeignRefs<CurrentSchema>,
			ExcludeVirtualForeignRefs<PreviousSchema>
		>
	]: (this: DataType) => Promisable<CreateType<CurrentSchema[K]>>;
}

export interface MigrationData {
	previousHyperschema: AnyHyperschema;
	migrationFunctions: Record<string, (this: DocumentType<any>) => void>;
	getData:
		| null
		| ((this: { meta: any }, args: { _id: any }) => Promisable<any>);
	initialize?(args: { mongoose: Mongoose; meta: any }): Promisable<void>;
}

export interface MigrationOptions {
	initialize?(args: { mongoose: Mongoose; meta: any }): Promisable<void>;
}
