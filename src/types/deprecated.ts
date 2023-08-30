import type { IsNever } from 'type-fest';

export type Deprecated<T> = never;
export type IsNeverArray<T> = [T] extends [never[]] ? true : false;
// prettier-ignore
export type IsDeprecated<Value> =
	| IsNever<Value> extends true ? true
	: IsNeverArray<Value> extends true ? true
	: false;
