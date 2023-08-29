import type { Deprecated } from '~/types/deprecated.js';
import {
	IsForeignRef,
	IsForeignRefArray,
	IsVirtualForeignRef,
	IsVirtualForeignRefArray
} from '~/types/ref.js';

// prettier-ignore
export type CreateType<FieldType> =
	  FieldType extends Deprecated[] ? never[]
	: FieldType extends Deprecated ? FieldType
	: IsForeignRefArray<FieldType> extends true ? string[]
	: IsForeignRef<FieldType> extends true
		? string | (null extends FieldType ? null : never)
	: FieldType

// prettier-ignore
export type CreateInput<Model> = {
	[K in keyof Model as
		  K extends '_v' ? never
		: K extends '__self' ? never
		: Model[K] extends Deprecated[] ? K
		: Model[K] extends Deprecated ? K
		: IsVirtualForeignRefArray<Model[K]> extends true ? never
		: IsVirtualForeignRef<Model[K]> extends true ? never
		: K
	]: CreateType<Model[K]>
};
