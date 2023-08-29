import type { Deprecated } from '~/types/deprecated.js';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

// prettier-ignore
export type CreateType<FieldType> =
	  FieldType extends Deprecated[] ? never[]
	: FieldType extends Deprecated ? FieldType
	: NonNullable<FieldType> extends ForeignRef<any, any, any>[] ? string[]
	: NonNullable<FieldType> extends ForeignRef<any, any, any>
		? string | (null extends FieldType ? null : never)
	: FieldType

// prettier-ignore
export type CreateInput<Model> = {
	[K in keyof Model as
		  K extends '_v' ? never
		: K extends '__self' ? never
		: Model[K] extends Deprecated[] ? K
		: Model[K] extends Deprecated ? K
		: NonNullable<Model[K]> extends VirtualForeignRef<any, any, any> ? never
		: NonNullable<Model[K]> extends VirtualForeignRef<any, any, any>[] ? never
		: K
	]: CreateType<Model[K]>
};
