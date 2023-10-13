/**
	Get all keys from "T" that are a function
	does NOT filter out getters / setters
*/
export type GetFunctionKeys<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

/**
	Remove all properties from "T" that are a function
	does NOT filter out getters / setters
*/
export type FilterOutFunctionKeys<T extends object> = Omit<T, GetFunctionKeys<T>>;

/** Generic "Function" type, because typescript does not like using "Function" directly in strict mode */
export type Func = (...args: any[]) => any;

/**
	The Type of a function to generate a custom model name.
*/
export type CustomNameFunction = (options: IModelOptions) => string;

/**
	Defer a reference with a function (or as other projects call it "Forward declaration")
	@param type This is just to comply with the common pattern of `type => ActualType`
*/
export type DeferredFunc<T = any> = (...args: unknown[]) => T;

/**
	Dynamic Functions, since mongoose 4.13
	@param doc The Document current document
*/
export type DynamicStringFunc<T extends AnyParamConstructor<any>> = (doc: DocumentType<T>) => string;

/** Type to keep the "discriminators" options consistent in types */
export type NestedDiscriminatorsFunction = DeferredFunc<(AnyParamConstructor<any> | DiscriminatorObject)[]>;

/**
	Any-param Constructor
*/
export type AnyParamConstructor<T> = new (...args: any) => T;
