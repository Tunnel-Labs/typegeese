import { DecoratorKeys } from '~/utils/decorator-keys.js';

export function getSchemaPropMap(schema: any): Map<string, any> {
	const basePropMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		schema.prototype
	) as Map<string, { options?: { ref: string } }>;

	const prototypePropMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		Object.getPrototypeOf(schema).prototype
	) as Map<string, { options?: { ref: string } }>;

	const propMap = new Map([
		...basePropMap.entries(),
		...prototypePropMap.entries()
	]);

	return propMap;
}
