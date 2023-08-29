import type { IsAny } from 'type-fest';
import { IsForeignRef } from '~/types/ref.js';

// prettier-ignore
export type OnForeignModelDeletedActions<Model> = {
	[K in keyof Model as
		  IsAny<Model[K]> extends true ? never
		: IsForeignRef<Model[K]> extends true ? K
		: never
	]:
		| (null extends Model[K] ? 'SetNull' : never)
		| 'Cascade'
		| 'Restrict';
};
