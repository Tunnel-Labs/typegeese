/**
	Gets the signature (parameters with their types, and the return type) of a function type.
 *
	@description Should be used when defining an interface for a class that uses query methods.
 *
	@example
	```ts
	function sendMessage(recipient: string, sender: string, priority: number, retryIfFails: boolean) {
	 // some logic...
	 return true;
	}
 *
	// Both of the following types will be identical.
	type SendMessageType = AsQueryMethod<typeof sendMessage>;
	type SendMessageManualType = (recipient: string, sender: string, priority: number, retryIfFails: boolean) => boolean;
	```
*/
export type AsQueryMethod<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>;

/**
	Helper type to easily set the `this` type in a QueryHelper function
 *
	@example
	function findById(this: QueryHelperThis<typeof YourClass, YourClassQueryHelpers>, id: string) {
	  return this.findOne({ _id: id });
	}
*/
export type QueryHelperThis<
  // TODO: consider replacing T directly with S
  T extends AnyParamConstructor<any>,
  QueryHelpers,
  S = DocumentType<InstanceType<T>, QueryHelpers>,
> = mongoose.QueryWithHelpers<S | null, S, QueryHelpers>;

/**
	Type for the Values stored in the Reflection for Query Methods
	@example
	```ts
	const queryMethods: QueryMethodMap = new Map(Reflect.getMetadata(DecoratorKeys.QueryMethod, target) ?? []);
	```
*/
export type QueryMethodMap = Map<string, Func>;