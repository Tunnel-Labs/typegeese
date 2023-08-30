import type { IsNever } from 'type-fest';

export type Deprecated<T> = never;
export type IsDeprecated<Value> = IsNever<Value>;
