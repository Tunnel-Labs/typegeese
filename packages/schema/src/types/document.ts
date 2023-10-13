import type * as mongoose from 'mongoose';
import type { BeAnObject, IObjectWithTypegooseFunction } from './$.js';

/**
	Get the Type of an instance of a Document with Class properties
	@example
	```ts
	class ClassName {
	  @prop()
	  public someProperty: string;
	}
	const NameModel = getModelForClass(ClassName);
 *
	const doc: DocumentType<ClassName> = await NameModel.create({});
	```
*/
// prettier-ignore
export type DocumentType<T, QueryHelpers = BeAnObject> =
	mongoose.Document<unknown, QueryHelpers, T> &
	mongoose.Require_id<T> &
	IObjectWithTypegooseFunction;

/**
	Get the Type of an instance of a SubDocument with Class properties
*/
// prettier-ignore
export type SubDocumentType<T, QueryHelpers = BeAnObject> =
	DocumentType<T, QueryHelpers> &
	mongoose.Types.Subdocument;

/**
	Get the Type of an instance of a SubDocument that exists within an array, with Class properties
*/
// prettier-ignore
export type ArraySubDocumentType<T, QueryHelpers = BeAnObject> =
	DocumentType<T, QueryHelpers> &
	mongoose.Types.ArraySubdocument;
