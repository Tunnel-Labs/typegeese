import type * as mongoose from 'mongoose';
import type { ICustomOptions, ITypegooseOptions } from '../$.js';

export interface IGlobalOptions {
	/** Typegoose Options */
	options?: ICustomOptions;

	/** Schema Options that should get applied to all models */
	schemaOptions?: mongoose.SchemaOptions;

	/**
		Global Options for general Typegoose
	*/
	globalOptions?: ITypegooseOptions;
}
