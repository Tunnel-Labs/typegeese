import type { Exact } from 'type-fest';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';
import type { t } from './t.js';

// prettier-ignore
export type ShapeProperties<Schema> = Omit<
	{
		[K in keyof Schema]

			: Schema[K] extends ForeignRef<any, infer ForeignSchema, any>
				? t.ForeignRef<ForeignSchema>
			: Schema[K] extends ForeignRef<any, infer ForeignSchema, any>[]
				? t.ForeignRef<ForeignSchema>[]
			: Schema[K] extends VirtualForeignRef<any, infer ForeignSchema, any>
				? t.VirtualForeignRef<ForeignSchema>
			: Schema[K] extends VirtualForeignRef<any, infer ForeignSchema, any>[]
				? t.VirtualForeignRef<ForeignSchema>[]
			: Schema[K];
	},
	'__self' | '_v'
>;

export type Shape<Schema, T extends Exact<ShapeProperties<Schema>, T>> = T;
