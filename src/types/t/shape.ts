import type { Exact } from 'type-fest';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';
import type { t } from './$.js';

// prettier-ignore
export type ShapeProperties<Schema> = {
	[K in keyof Schema as
		| K extends '_v' ? never
		: K extends '__type__' ? never
		: K extends '__migration__' ? never
		: K]:

		| Schema[K] extends ForeignRef<any, infer ForeignSchema, any>
			? t.ForeignRef<ForeignSchema>
		: Schema[K] extends ForeignRef<any, infer ForeignSchema, any>[]
			? t.ForeignRef<ForeignSchema>[]
		: Schema[K] extends VirtualForeignRef<any, infer ForeignSchema, any>
			? t.VirtualForeignRef<ForeignSchema>
		: Schema[K] extends VirtualForeignRef<any, infer ForeignSchema, any>[]
			? t.VirtualForeignRef<ForeignSchema>[]
		: Schema[K];
}

export type Shape<
	Schema,
	T extends Exact<ShapeProperties<Schema>, T>,
	_Relations
> = Schema;
