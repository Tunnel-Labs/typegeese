import type { IsAny } from 'type-fest';

import type { ForeignRef } from '~/types/refs.js';

// prettier-ignore
export type OnForeignModelDeletedActions<Model> = {
	[K in keyof Model as
		IsAny<Model[K]> extends true
			? never
		: NonNullable<Model[K]> extends ForeignRef<any, any, any>
			? K
		: never
	]:
		| (null extends Model[K] ? 'SetNull' : never)
		| 'Cascade'
		| 'Restrict';
};
