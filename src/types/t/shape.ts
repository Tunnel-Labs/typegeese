import type { Exact } from 'type-fest';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';
import type { IsDeprecated } from '~/types/deprecated.js';
import type { t } from './t.js';

// prettier-ignore
export type ShapeProperties<Schema> = {
	[K in keyof Schema as
		| K extends '__self' ? never
		: K extends '_v' ? never
		: IsDeprecated<Schema[K]> extends true ? never
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

export type Shape<Schema, T extends Exact<ShapeProperties<Schema>, T>> = Schema;
