export type RefType = mongoose.RefType;

/**
	Reference another Model
*/
export type Ref<
  PopulatedType,
  RawId extends mongoose.RefType = PopulatedType extends { _id?: mongoose.RefType }
    ? NonNullable<PopulatedType['_id']>
    : mongoose.Types.ObjectId,
> = mongoose.PopulatedDoc<DocumentType<PopulatedType>, RawId>;