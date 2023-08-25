import type { DocumentType } from "@typegoose/typegoose";
import type { Promisable } from "type-fest";
import { Deprecated } from "./deprecated.js";

export type Diff<T, V> = {
  [P in Exclude<keyof T, keyof V>]: T[P];
};

// prettier-ignore
export type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof CurrentModel
> =
	Key extends '_version'
		? true
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
  [K in keyof CurrentModel as IsSupersetKey<
    PreviousModel,
    CurrentModel,
    K
  > extends false
    ? K
    : never]: true;
};

export interface NotSupersetError<Message, _Keys> {
  "Not a superset:": Message;
}

// prettier-ignore
export type Migrations<PreviousModel, CurrentModel> =
	'_version' extends keyof CurrentModel
		? CurrentModel['_version'] extends 'v0'
			? null
		: NonSupersetKeys<PreviousModel, CurrentModel> extends never
		? {
				[K in keyof Diff<CurrentModel, PreviousModel>]: (
					this: DocumentType<CurrentModel>
				) => Promisable<CurrentModel[K]>;
			}
		: NotSupersetError<'The current model must be a superset of the previous model in order to be backwards-compatible; the following keys are incompatible:', NonSupersetKeys<PreviousModel, CurrentModel>>
	: never
