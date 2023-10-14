import type { ForeignRef, VirtualForeignRef } from '@typegeese/types';
import * as t from '../utils/t.js';

// prettier-ignore
export type ShapeTypeProperties<Schema> = {
	[
		K in keyof Schema as
			K extends '_v' ?
				never :
			K extends '__type__' ?
				never :
			K extends '__name__' ?
				never :
			K
	]:
		NonNullable<Schema[K]> extends ForeignRef<any, infer ForeignSchema, any> ?
			t.ForeignRef<ForeignSchema> |
			(null extends Schema[K] ? null : never) :
		NonNullable<Schema[K]> extends ForeignRef<any, infer ForeignSchema, any>[] ?
			t.ForeignRef<ForeignSchema>[] |
			(null extends Schema[K] ? null : never) :
		NonNullable<Schema[K]> extends VirtualForeignRef<any, infer ForeignSchema, any> ?
			t.VirtualForeignRef<ForeignSchema> |
			(null extends Schema[K] ? null : never) :
		NonNullable<Schema[K]> extends VirtualForeignRef<any, infer ForeignSchema, any>[] ?
			t.VirtualForeignRef<ForeignSchema>[] |
			(null extends Schema[K] ? null : never) :
		Schema[K];
}

// prettier-ignore
export type ShapeObjectProperties<ShapeType> = {
	[K in keyof ShapeType]:
		NonNullable<ShapeType[K]> extends t.ForeignRef<any> | t.ForeignRef<any>[] ?
			typeof t.ForeignRef :
		NonNullable<ShapeType[K]> extends t.VirtualForeignRef<any> | t.VirtualForeignRef<any>[] ?
			typeof t.VirtualForeignRef :
		typeof t
}
