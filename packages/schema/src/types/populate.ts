/**
	Type for the Values stored in the Reflection for Virtual Populates
	@example
	```ts
	const virtuals: VirtualPopulateMap = new Map(Reflect.getMetadata(DecoratorKeys.VirtualPopulate, target.constructor) ?? []);
	```
*/
export type VirtualPopulateMap = Map<string, VirtualOptions & Record<string, unknown>>;
