import type { AnyParamConstructor } from './$.js';

export interface DiscriminatorObject {
	/** The Class to use */
	type: AnyParamConstructor<any>;

	/**
		The Name to differentiate between other classes
		Mongoose JSDOC: [value] the string stored in the `discriminatorKey` property. If not specified, Mongoose uses the `name` parameter.
		@default {string} The output of "getName"
	*/
	value?: string;
}

/**
	Type for the Values stored in the Reflection for Nested Discriminators
	@example
	```ts
	const disMap: NestedDiscriminatorsMap = new Map(Reflect.getMetadata(DecoratorKeys.NestedDiscriminators, target) ?? []);
	```
*/
export type NestedDiscriminatorsMap = Map<string, DiscriminatorObject[]>;
