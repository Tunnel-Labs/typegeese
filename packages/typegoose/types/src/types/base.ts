import type { Types } from 'mongoose';
import type { RefType } from './$.js';

/**
	This Interface can be used when "_id" and "id" need to be defined in types
*/
export interface Base<IDType extends RefType = Types.ObjectId> {
	_id: IDType;
	/**
		This getter/setter doesn't exist if "schemaOptions.id" being set to "false"
   */
	id: string;
}
