import type { Opaque } from 'type-fest';

export type ForeignRef<Schema> = Opaque<Schema, 'ForeignRef'>;
export type VirtualForeignRef<Schema> = Opaque<Schema, 'VirtualForeignRef'>;
