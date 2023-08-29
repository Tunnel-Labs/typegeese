export type InstanceTypeOrSelf<T extends abstract new (...args: any) => any> =
	T extends abstract new (...args: any) => infer R ? R : T;
