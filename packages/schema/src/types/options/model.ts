import type * as mongoose from 'mongoose';
import type { ICustomOptions } from '../$.js';

export interface IModelOptions {
	/** An Existing Mongoose Connection */
	existingMongoose?: mongoose.Mongoose;

	/** Supports all Mongoose's Schema Options */
	schemaOptions?: mongoose.SchemaOptions;

	/** An Existing Connection */
	existingConnection?: mongoose.Connection;

	/** Typegoose Custom Options */
	options?: ICustomOptions;
}
