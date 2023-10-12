import type {
	IsForeignRef,
	IsForeignRefArray,
	IsVirtualForeignRef,
	IsVirtualForeignRefArray
} from '~/types/ref.js';

// prettier-ignore
export type CreateType<FieldType> =
	| IsForeignRefArray<FieldType> extends true ? string[]
	: IsForeignRef<FieldType> extends true ?
		string | (null extends FieldType ? null : never)
	: FieldType

// prettier-ignore
export type CreateInput<Model> = {
	[K in keyof Model as
		| K extends '_v' ? never
		: K extends '__type__' ? never
		: K extends '__migration__' ? never
		: IsVirtualForeignRefArray<Model[K]> extends true ? never
		: IsVirtualForeignRef<Model[K]> extends true ? never
		: K
	]: CreateType<Model[K]>
};
