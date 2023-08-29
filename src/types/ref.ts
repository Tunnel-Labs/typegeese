import type * as mongoose from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';

export interface Ref<
	PopulatedType,
	RawId extends mongoose.RefType = PopulatedType extends {
		_id?: mongoose.RefType;
	}
		? NonNullable<PopulatedType['_id']>
		: mongoose.Types.ObjectId
	// @ts-expect-error: Necessary
> extends mongoose.PopulatedDoc<DocumentType<PopulatedType>, RawId> {
	__ref?: true;
}
