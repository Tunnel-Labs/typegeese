import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { NormalizedHyperschema } from '~/types/hyperschema.js';
import { CreateType } from '~/types/create.js';
import { IsVirtualForeignRef, IsVirtualForeignRefArray } from '~/types/ref.js';
import { Mongoose } from 'mongoose';

export type Diff<T, V> = {
	[P in Exclude<keyof T, keyof V>]: T[P];
};

// prettier-ignore
export type ExcludeVirtualForeignRefs<Model> = {
	[K in keyof Model as
		| IsVirtualForeignRef<Model[K]> extends true ? never
		: IsVirtualForeignRefArray<Model[K]> extends true ? never
		: K extends '__migration__' ? never
		: K]: Model[K];
};

// prettier-ignore
export type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof ExcludeVirtualForeignRefs<CurrentModel>
> =
	| Key extends '_v' ? true
	: Key extends '__type__' ? true
	: Key extends '__migration__' ? true
	: Key extends keyof PreviousModel
		? CurrentModel[Key] extends PreviousModel[Key] ? true
		: false
	: true;

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
export type MigrationFunctions<PreviousModel, CurrentModel, DataType> =
	| '_v' extends keyof CurrentModel ?
		| CurrentModel['_v'] extends 'v0' ? null
		// : NonSupersetKeys<PreviousModel, CurrentModel> extends never ?
			: {
				[K in keyof Diff<
					ExcludeVirtualForeignRefs<CurrentModel>,
					ExcludeVirtualForeignRefs<PreviousModel>
				>]: (
					this: DataType
				) => Promisable<CreateType<CurrentModel[K]>>;
			}
			// : NotSupersetError<'The current model must be a superset of the previous model in order to be backwards-compatible; the following keys are incompatible:', NonSupersetKeys<PreviousModel, CurrentModel>>
	: never

export interface MigrationData {
	previousHyperschema: NormalizedHyperschema<any>;
	migrationFunctions: Record<string, (this: DocumentType<any>) => void>;
	getData:
		| null
		| ((this: { meta: any }, args: { _id: any }) => Promisable<any>);
	initialize?(args: { mongoose: Mongoose; meta: any }): Promisable<void>;
}

export interface MigrationOptions {
	initialize?(args: { mongoose: Mongoose; meta: any }): Promisable<void>;
}
