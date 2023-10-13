
/**
	Type for the Values stored in the Reflection for Plugins
	@example
	```ts
	const plugins: IPluginsArray[] = Array.from(Reflect.getMetadata(DecoratorKeys.Plugins, target) ?? []);
	```
*/
export interface IPluginsArray {
  /** The Plugin Function to add */
  mongoosePlugin: Func;
  /** The Plugin's options, which could be anything because mongoose does not enforce it to be a object */
  options: any | undefined;
}