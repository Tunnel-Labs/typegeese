import type { Deprecated } from '~/types/deprecated.js';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

// prettier-ignore
export type CreateInput<Model> = {
	[K in keyof Model as
		K extends '_version'
			? never
		: Model[K] extends Deprecated[]
			? K
		: Model[K] extends Deprecated
			? K
		: NonNullable<Model[K]> extends VirtualForeignRef<any, any, any>
			? never
		: NonNullable<Model[K]> extends VirtualForeignRef<any, any, any>[]
			? never
		: K
	]
		: Model[K] extends Deprecated[]
			? never[]
		: Model[K] extends Deprecated
			? Model[K]
		: NonNullable<Model[K]> extends ForeignRef<any, any, any>[]
			? string[]
		: NonNullable<Model[K]> extends ForeignRef<any, any, any>
			? string | (null extends Model[K] ? null : never)
		: Model[K];
};
