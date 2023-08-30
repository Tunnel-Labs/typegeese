import type { Deprecated } from '~/types/deprecated.js';

export function deprecated<Value>(value: Value) {
	return value as Deprecated<Value>;
}
