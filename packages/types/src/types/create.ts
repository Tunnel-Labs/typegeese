import type {
	IsForeignRef,
	IsForeignRefArray,
	IsVirtualForeignRef,
	IsVirtualForeignRefArray
} from './ref.js';

// prettier-ignore
export type CreateType<FieldType> =
	IsForeignRefArray<FieldType> extends true ?
		string[] :
	IsForeignRef<FieldType> extends true ?
		string | (null extends FieldType ? null : never) :
	FieldType

// prettier-ignore
export type CreateInput<Schema> = {
	[
		K in keyof Schema as
			K extends '_v' | '__type__' ?
				never :
			IsVirtualForeignRefArray<Schema[K]> extends true ?
				never :
			IsVirtualForeignRef<Schema[K]> extends true ?
				never :
			K
	]: CreateType<Schema[K]>
};
