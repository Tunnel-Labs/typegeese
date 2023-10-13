import type * as mongoose from 'mongoose';
import type { ICustomOptions } from '../$.js';

/** Interface for just all naming options */
export interface INamingOptions {
	/** Same as in {@link ICustomOptions} */
	customName?: ICustomOptions['customName'];

	/** Same as in {@link ICustomOptions} */
	automaticName?: ICustomOptions['automaticName'];

	/** Same as in {@link mongoose.SchemaOptions} */
	schemaCollection?: mongoose.SchemaOptions['collection'];
}
