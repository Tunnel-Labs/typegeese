import type * as mongoose from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';
import { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

export interface Ref<
	PopulatedType,
	RawId extends mongoose.RefType = PopulatedType extends {
		_id?: mongoose.RefType;
	}
		? NonNullable<PopulatedType['_id']>
		: mongoose.Types.ObjectId
	// @ts-expect-error: Necessary
> extends mongoose.PopulatedDoc<DocumentType<PopulatedType>, RawId> {
	__ref?: true;
}

export type IsForeignRef<T> = ForeignRef<any, any, any> extends NonNullable<T>
	? true
	: false;

export type IsForeignRefArray<T> = ForeignRef<
	any,
	any,
	any
> extends NonNullable<T>
	? true
	: false;

export type IsVirtualForeignRef<T> = VirtualForeignRef<
	any,
	any,
	any
> extends NonNullable<T>
	? true
	: false;

export type IsVirtualForeignRefArray<T> = VirtualForeignRef<
	any,
	any,
	any
>[] extends NonNullable<T>
	? true
	: false;
