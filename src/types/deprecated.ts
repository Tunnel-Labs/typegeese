import type { IsNever } from 'type-fest';

export type Deprecated = never;
export type IsDeprecated<Value> = IsNever<Value>;
