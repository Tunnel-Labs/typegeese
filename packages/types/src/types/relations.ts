import type { IsAny } from 'type-fest';
import type { IsForeignRef } from './ref.js';

// prettier-ignore
export type Relations<Schema> = {
	[
		K in keyof Schema as
			IsAny<Schema[K]> extends true ?
				never :
			IsForeignRef<Schema[K]> extends true ?
				K :
			never
	]:
		'Cascade' |
		'Restrict' |
		(null extends Schema[K] ? 'SetNull' : never);
};

export type AnyRelations = Record<string, 'SetNull' | 'Cascade' | 'Restrict'>;
