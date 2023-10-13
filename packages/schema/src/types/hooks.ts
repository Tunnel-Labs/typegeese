import type * as mongoose from 'mongoose';
import type { Func } from './$.js';

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
  post<S extends object | mongoose.Query<any, any>, T = S extends mongoose.Query<any, any> ? S : mongoose.Query<DocumentType<S>, DocumentType<S>>>(
    method: MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options: SchemaPostOptions & { errorHandler: true }
  ): ClassDecorator;
  post<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options: SchemaPostOptions & { errorHandler: true }
  ): ClassDecorator;
  post<T extends Aggregate<any>>(
    method: 'aggregate' | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T, Array<any>>,
    options: SchemaPostOptions & { errorHandler: true }
  ): ClassDecorator;
  post<S extends AnyParamConstructor<any> | Model<any>, T = S extends Model<any> ? S : ReturnModelType<S>>(
    method: 'insertMany' | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options: SchemaPostOptions & { errorHandler: true }
  ): ClassDecorator;

  // normal post hooks
  post<S extends object | Query<any, any>, T = S extends Query<any, any> ? S : Query<DocumentType<S>, DocumentType<S>>>(
    method: MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp,
    fn: PostMiddlewareFunction<T, QueryResultType<T>>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp,
    fn: PostMiddlewareFunction<T, T>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<T extends Aggregate<any>>(
    method: 'aggregate' | RegExp,
    fn: PostMiddlewareFunction<T, Array<AggregateExtract<T>>>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<S extends AnyParamConstructor<any> | Model<any>, T = S extends Model<any> ? S : ReturnModelType<S>>(
    method: 'insertMany' | RegExp,
    fn: PostMiddlewareFunction<T, T>,
    options?: SchemaPostOptions
  ): ClassDecorator;

  // error handling post hooks
  post<S extends object | Query<any, any>, T = S extends Query<any, any> ? S : Query<DocumentType<S>, DocumentType<S>>>(
    method: MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<T extends Aggregate<any>>(
    method: 'aggregate' | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T, Array<any>>,
    options?: SchemaPostOptions
  ): ClassDecorator;
  post<S extends AnyParamConstructor<any> | Model<any>, T = S extends Model<any> ? S : ReturnModelType<S>>(
    method: 'insertMany' | RegExp,
    fn: ErrorHandlingMiddlewareFunction<T>,
    options?: SchemaPostOptions
  ): ClassDecorator;

  // special pre hooks for each "document: true, query: false" and "document: false, query: true"
  pre<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: MongooseQueryOrDocumentMiddleware | MongooseQueryOrDocumentMiddleware[],
    fn: PreMiddlewareFunction<T>,
    options: SchemaPreOptions & { document: true; query: false }
  ): ClassDecorator;
  pre<S extends object | Query<any, any>, T = S extends Query<any, any> ? S : Query<DocumentType<S>, DocumentType<S>>>(
    method: MongooseQueryOrDocumentMiddleware | MongooseQueryOrDocumentMiddleware[],
    fn: PreMiddlewareFunction<T>,
    options: SchemaPreOptions & { document: false; query: true }
  ): ClassDecorator;

  // normal pre hooks
  pre<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: 'save',
    fn: PreSaveMiddlewareFunction<T>,
    options?: SchemaPreOptions
  ): ClassDecorator;
  pre<S extends object | Query<any, any>, T = S extends Query<any, any> ? S : Query<DocumentType<S>, DocumentType<S>>>(
    method: MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp,
    fn: PreMiddlewareFunction<T>,
    options?: SchemaPreOptions
  ): ClassDecorator;
  pre<S extends object | HydratedDocument<any, any>, T = S extends Document ? S : HydratedDocument<DocumentType<S>, any>>(
    method: MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp,
    fn: PreMiddlewareFunction<T>,
    options?: SchemaPreOptions
  ): ClassDecorator;
  pre<T extends Aggregate<any>>(method: 'aggregate' | RegExp, fn: PreMiddlewareFunction<T>, options?: SchemaPreOptions): ClassDecorator;
  pre<S extends AnyParamConstructor<any> | Model<any>, T = S extends Model<any> ? S : ReturnModelType<S>>(
    method: 'insertMany' | RegExp,
    fn: (this: T, next: (err?: CallbackError) => void, docs: any | Array<any>) => void | Promise<void>,
    options?: SchemaPreOptions
  ): ClassDecorator;
}