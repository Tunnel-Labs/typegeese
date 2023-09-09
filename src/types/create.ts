import type { Deprecated, IsDeprecated } from '~/types/deprecated.js';
import {
	IsForeignRef,
	IsForeignRefArray,
	IsVirtualForeignRef,
	IsVirtualForeignRefArray
} from '~/types/ref.js';

// prettier-ignore
export type CreateType<FieldType> =
	| IsDeprecated<FieldType> extends true ? never[]
	: IsForeignRefArray<FieldType> extends true ? string[]
	: IsForeignRef<FieldType> extends true
		? string | (null extends FieldType ? null : never)
	: FieldType

// prettier-ignore
export type CreateInput<Model> = {
	[K in keyof Model as
		  K extends '_v' ? never
		: K extends '__type' ? never
		// We need users to specify values of deprecated fields
		: IsDeprecated<Model[K]> extends true ? K
		: IsVirtualForeignRefArray<Model[K]> extends true ? never
		: IsVirtualForeignRef<Model[K]> extends true ? never
		: K
	]: CreateType<Model[K]>
};
