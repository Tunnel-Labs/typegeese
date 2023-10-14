import type * as mongoose from 'mongoose';
import type { KeyStringAny } from './$.js';

/**
	Alias of "mongoose.IndexOptions" for convenience
*/
export type IndexOptions = mongoose.IndexOptions;

/**
	Type for the Values stored in the Reflection for Indexes
	@example
	```ts
	const indices: IIndexArray[] = Reflect.getMetadata(DecoratorKeys.Index, target) || []);
	```
*/
export interface IIndexArray {
	fields: KeyStringAny;
	options?: IndexOptions;
}
