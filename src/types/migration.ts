import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { IsDeprecated } from '~/types/deprecated.js';
import type { NormalizedHyperschema } from '~/types/hyperschema.js';
import { CreateType } from '~/types/create.js';
import { IsVirtualForeignRef, IsVirtualForeignRefArray } from '~/types/ref.js';

export type Diff<T, V> = {
	[P in Exclude<keyof T, keyof V>]: T[P];
};

// prettier-ignore
export type ExcludeVirtualForeignRefs<Model> = {
	[K in keyof Model as
		| IsVirtualForeignRef<Model[K]> extends true ? never
		: IsVirtualForeignRefArray<Model[K]> extends true ? never
		: K]: Model[K];
};

// prettier-ignore
export type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof ExcludeVirtualForeignRefs<CurrentModel>
> =
	| Key extends '_v' ? true
	: Key extends '__self' ? true
	: Key extends keyof PreviousModel
		? IsDeprecated<CurrentModel[Key]> extends true ? true
		: CurrentModel[Key] extends PreviousModel[Key] ? true
		: false
	: true;

export type NonSupersetKeys<PreviousModel, CurrentModel> = keyof {
	[K in keyof ExcludeVirtualForeignRefs<PreviousModel> as
		// @ts-expect-error: works
		| IsSupersetKey<PreviousModel, CurrentModel, K> extends false ? K
		: never]: true;
};

export interface NotSupersetError<Message, _Keys> {
	'Not a superset:': Message;
}

// prettier-ignore
export type MigrationFunctions<PreviousModel, CurrentModel, DataType> =
	| '_v' extends keyof CurrentModel ?
		| CurrentModel['_v'] extends 'v0' ? null
		: NonSupersetKeys<PreviousModel, CurrentModel> extends never
			? {
				[K in keyof Diff<
					ExcludeVirtualForeignRefs<CurrentModel>,
					ExcludeVirtualForeignRefs<PreviousModel>
				>]: (
					this: DataType
				) => Promisable<CreateType<CurrentModel[K]>>;
			}
			: NotSupersetError<'The current model must be a superset of the previous model in order to be backwards-compatible; the following keys are incompatible:', NonSupersetKeys<PreviousModel, CurrentModel>>
	: never

export interface MigrationData {
	previousHyperschema: NormalizedHyperschema<any>;
	migrationFunctions: Record<string, (this: DocumentType<any>) => void>;
	getData: (this: { meta: any }, args: { _id: any }) => Promisable<any>;
}
