import type * as mongoose from 'mongoose';
import type { DocumentType } from './$.js';

export type RefType = mongoose.RefType;

/**
	Reference another Model
*/
// prettier-ignore
export type Ref<
	PopulatedType,
	RawId extends mongoose.RefType = PopulatedType extends {
		_id?: mongoose.RefType;
	} ?
		NonNullable<PopulatedType['_id']> :
	mongoose.Types.ObjectId
> = mongoose.PopulatedDoc<DocumentType<PopulatedType>, RawId>;
