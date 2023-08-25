import type { Opaque } from 'type-fest';

export type Deprecated<T = {}> = Opaque<T, 'deprecated'>;
