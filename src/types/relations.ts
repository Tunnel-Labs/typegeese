import type { IsAny } from 'type-fest';
import type { IsForeignRef } from '~/types/ref.js';

// prettier-ignore
export type Relations<Schema> = {
	[K in keyof Schema as
		| IsAny<Schema[K]> extends true ? never
		: IsForeignRef<Schema[K]> extends true ? K
		: never
	]:
		| (null extends Schema[K] ? 'SetNull' : never)
		| 'Cascade'
		| 'Restrict';
};

export type AnyRelations = Record<string, 'SetNull' | 'Cascade' | 'Restrict'>;
