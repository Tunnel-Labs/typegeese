import type { DocumentType } from '@typegoose/typegoose';
import type * as mongoose from 'mongoose';

import type { ForeignRef, VirtualForeignRef } from './refs.js';

// prettier-ignore
export interface Ref<
	PopulatedType,
	RawId extends mongoose.RefType =
		PopulatedType extends { _id?: mongoose.RefType } ?
			NonNullable<PopulatedType['_id']> :
		mongoose.Types.ObjectId
	// @ts-expect-error: necessary
> extends mongoose.PopulatedDoc<DocumentType<PopulatedType>, RawId> {
	__ref?: true;
}

// prettier-ignore
export type IsForeignRef<T> =
	ForeignRef<any, any, any> extends NonNullable<T> ?
		true :
	false;

// prettier-ignore
export type IsForeignRefArray<T> =
	ForeignRef<any, any, any>[] extends NonNullable<T> ?
		true :
	false;

// prettier-ignore
export type IsVirtualForeignRef<T> =
	VirtualForeignRef<any, any, any> extends NonNullable<T> ?
		true :
	false;

// prettier-ignore
export type IsVirtualForeignRefArray<T> =
	VirtualForeignRef<any, any, any>[] extends NonNullable<T> ?
		true :
	false;
