export type ArrayInnerValue<T> = T extends Array<infer U>
	? ArrayInnerValue<U>
	: T;
