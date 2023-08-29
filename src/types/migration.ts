import type { DocumentType } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { Deprecated } from '~/types/deprecated.js';
import type { NormalizedHyperschema } from '~/types/hyperschema.js';
import type { ModelSchema } from '~/classes/index.js';
import type { VirtualForeignRef } from '~/types/refs.js';

export type Diff<T, V> = {
	[P in Exclude<keyof T, keyof V>]: T[P];
};

export type ExcludeVirtualForeignRefs<Model> = {
	[K in keyof Model as Model[K] extends VirtualForeignRef<any, any, any>
		? never
		: Model[K] extends VirtualForeignRef<any, any, any>[]
		? never
		: K]: Model[K];
};

// prettier-ignore
export type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof ExcludeVirtualForeignRefs<CurrentModel>
> =
	  Key extends '_v' ? true
	: Key extends '__self' ? true
	: Key extends keyof PreviousModel
		? CurrentModel[Key] extends Deprecated<infer T>
			? T extends PreviousModel[Key]
				? true
				: false
			: CurrentModel[Key] extends PreviousModel[Key]
			? true
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
	'_v' extends keyof CurrentModel
		? CurrentModel['_v'] extends 'v0'
			? null
		: NonSupersetKeys<PreviousModel, CurrentModel> extends never
		? {
				[K in keyof Diff<
					ExcludeVirtualForeignRefs<CurrentModel>,
					ExcludeVirtualForeignRefs<PreviousModel>
				>]: (
					this: DataType
				) => Promisable<CurrentModel[K]>;
			}
		: NotSupersetError<'The current model must be a superset of the previous model in order to be backwards-compatible; the following keys are incompatible:', NonSupersetKeys<PreviousModel, CurrentModel>>
	: never

export interface MigrationData {
	previousHyperschema: NormalizedHyperschema<any>;
	migrationFunctions: Record<string, (this: DocumentType<any>) => void>;
	getData: (this: { meta: any }, args: { _id: any }) => Promisable<any>;
}
