import type { Opaque } from 'type-fest';

export type Deprecated<T = never> = Opaque<T, 'deprecated'>;
