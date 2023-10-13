import type * as mongoose from 'mongoose';
import type {
	AnyParamConstructor,
	Func,
	QueryResultType,
	ReturnModelType,
	DocumentType
} from './$.js';

/** A Helper type to combine both mongoose Hook Option types */
export type HookOptionsEither =
	| mongoose.SchemaPreOptions
	| mongoose.SchemaPostOptions;

/**
	Type for the Values stored in the Reflection for Hooks
	@example
	```ts
	const postHooks: IHooksArray[] = Array.from(Reflect.getMetadata(DecoratorKeys.HooksPost, target) ?? []);
	```
*/
export interface IHooksArray {
	/** The Function to add as a hooks */
	func: Func;
	/** The Method to where this hook gets triggered */
	methods: (string | RegExp)[];
	/**
		Options for Hooks
		@see https://mongoosejs.com/docs/middleware.html#naming
   */
	options?: HookOptionsEither;
}

/**
	Definitions for "pre" and "post" function overloads
	basically a copy of https://github.com/Automattic/mongoose/blob/260261d3c2a3593b34f1e3358f4a8c000575f082/types/index.d.ts#L302-L346
	only modifications done are:
	- moved options from second argument to be the last argument
	- de-duplicate function that were duplicated because of options being the second argument
	- changing the generics in use to support the classes or overwriting whatever is used
	VERSION COPY OF 7.0.0
*/
export interface Hooks {
	// post hooks with errorhandling option
	post<
		S extends object | mongoose.Query<any, any>,
		T = S extends mongoose.Query<any, any>
			? S
			: mongoose.Query<DocumentType<S>, DocumentType<S>>
	>(
		method:
			| mongoose.MongooseQueryMiddleware
			| mongoose.MongooseQueryMiddleware[]
			| RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options: mongoose.SchemaPostOptions & { errorHandler: true }
	): ClassDecorator;
	post<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method:
			| mongoose.MongooseDocumentMiddleware
			| mongoose.MongooseDocumentMiddleware[]
			| RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options: mongoose.SchemaPostOptions & { errorHandler: true }
	): ClassDecorator;
	post<T extends mongoose.Aggregate<any>>(
		method: 'aggregate' | RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T, Array<any>>,
		options: mongoose.SchemaPostOptions & { errorHandler: true }
	): ClassDecorator;
	post<
		S extends AnyParamConstructor<any> | mongoose.Model<any>,
		T = S extends mongoose.Model<any> ? S : ReturnModelType<S>
	>(
		method: 'insertMany' | RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options: mongoose.SchemaPostOptions & { errorHandler: true }
	): ClassDecorator;

	// normal post hooks
	post<
		S extends object | mongoose.Query<any, any>,
		T = S extends mongoose.Query<any, any>
			? S
			: mongoose.Query<DocumentType<S>, DocumentType<S>>
	>(
		method:
			| mongoose.MongooseQueryMiddleware
			| mongoose.MongooseQueryMiddleware[]
			| RegExp,
		fn: mongoose.PostMiddlewareFunction<T, QueryResultType<T>>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method:
			| mongoose.MongooseDocumentMiddleware
			| mongoose.MongooseDocumentMiddleware[]
			| RegExp,
		fn: mongoose.PostMiddlewareFunction<T, T>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<T extends mongoose.Aggregate<any>>(
		method: 'aggregate' | RegExp,
		fn: mongoose.PostMiddlewareFunction<T, Array<mongoose.AggregateExtract<T>>>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<
		S extends AnyParamConstructor<any> | mongoose.Model<any>,
		T = S extends mongoose.Model<any> ? S : ReturnModelType<S>
	>(
		method: 'insertMany' | RegExp,
		fn: mongoose.PostMiddlewareFunction<T, T>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;

	// error handling post hooks
	post<
		S extends object | mongoose.Query<any, any>,
		T = S extends mongoose.Query<any, any>
			? S
			: mongoose.Query<DocumentType<S>, DocumentType<S>>
	>(
		method:
			| mongoose.MongooseQueryMiddleware
			| mongoose.MongooseQueryMiddleware[]
			| RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method:
			| mongoose.MongooseDocumentMiddleware
			| mongoose.MongooseDocumentMiddleware[]
			| RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<T extends mongoose.Aggregate<any>>(
		method: 'aggregate' | RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T, Array<any>>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;
	post<
		S extends AnyParamConstructor<any> | mongoose.Model<any>,
		T = S extends mongoose.Model<any> ? S : ReturnModelType<S>
	>(
		method: 'insertMany' | RegExp,
		fn: mongoose.ErrorHandlingMiddlewareFunction<T>,
		options?: mongoose.SchemaPostOptions
	): ClassDecorator;

	// special pre hooks for each "document: true, query: false" and "document: false, query: true"
	pre<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method:
			| mongoose.MongooseQueryOrDocumentMiddleware
			| mongoose.MongooseQueryOrDocumentMiddleware[],
		fn: mongoose.PreMiddlewareFunction<T>,
		options: mongoose.SchemaPreOptions & { document: true; query: false }
	): ClassDecorator;
	pre<
		S extends object | mongoose.Query<any, any>,
		T = S extends mongoose.Query<any, any>
			? S
			: mongoose.Query<DocumentType<S>, DocumentType<S>>
	>(
		method:
			| mongoose.MongooseQueryOrDocumentMiddleware
			| mongoose.MongooseQueryOrDocumentMiddleware[],
		fn: mongoose.PreMiddlewareFunction<T>,
		options: mongoose.SchemaPreOptions & { document: false; query: true }
	): ClassDecorator;

	// normal pre hooks
	pre<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method: 'save',
		fn: mongoose.PreSaveMiddlewareFunction<T>,
		options?: mongoose.SchemaPreOptions
	): ClassDecorator;
	pre<
		S extends object | mongoose.Query<any, any>,
		T = S extends mongoose.Query<any, any>
			? S
			: mongoose.Query<DocumentType<S>, DocumentType<S>>
	>(
		method:
			| mongoose.MongooseQueryMiddleware
			| mongoose.MongooseQueryMiddleware[]
			| RegExp,
		fn: mongoose.PreMiddlewareFunction<T>,
		options?: mongoose.SchemaPreOptions
	): ClassDecorator;
	pre<
		S extends object | mongoose.HydratedDocument<any, any>,
		T = S extends Document ? S : mongoose.HydratedDocument<DocumentType<S>, any>
	>(
		method:
			| mongoose.MongooseDocumentMiddleware
			| mongoose.MongooseDocumentMiddleware[]
			| RegExp,
		fn: mongoose.PreMiddlewareFunction<T>,
		options?: mongoose.SchemaPreOptions
	): ClassDecorator;
	pre<T extends mongoose.Aggregate<any>>(
		method: 'aggregate' | RegExp,
		fn: mongoose.PreMiddlewareFunction<T>,
		options?: mongoose.SchemaPreOptions
	): ClassDecorator;
	pre<
		S extends AnyParamConstructor<any> | mongoose.Model<any>,
		T = S extends mongoose.Model<any> ? S : ReturnModelType<S>
	>(
		method: 'insertMany' | RegExp,
		fn: (
			this: T,
			next: (err?: mongoose.CallbackError) => void,
			docs: any | Array<any>
		) => void | Promise<void>,
		options?: mongoose.SchemaPreOptions
	): ClassDecorator;
}
