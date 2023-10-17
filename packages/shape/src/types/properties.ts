import type { ForeignRef, VirtualForeignRef } from '@typegeese/types';
import * as t from '../utils/t.js';
import type { ShapeForeignRef, ShapeVirtualForeignRef } from './ref.js';

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
		NonNullable<ShapeType[K]> extends t.ForeignRef<infer Schema> | t.ForeignRef< infer Schema>[] ?
			ShapeForeignRef<
				// @ts-expect-error: works
				NonNullable<Schema['__name__']>
			> :
		NonNullable<ShapeType[K]> extends t.VirtualForeignRef<infer Schema> | t.VirtualForeignRef<infer Schema>[] ?
			ShapeVirtualForeignRef<
				// @ts-expect-error: works
				NonNullable<Schema['__name__']>
			> :
		typeof t
}
