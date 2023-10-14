import type * as mongoose from 'mongoose';
import type { BasePropOptions } from '../$.js';

export interface ValidateNumberOptions {
	/** Only allow numbers that are higher than this */
	min?: mongoose.SchemaTypeOptions<any>['min'];

	/** Only allow numbers lower than this */
	max?: mongoose.SchemaTypeOptions<any>['max'];

	/** Only allow Values from the enum */
	enum?: number[];
}

export type PropOptionsForNumber = BasePropOptions & ValidateNumberOptions;
