import type * as mongoose from 'mongoose';
import type {
	AnyParamConstructor,
	BeAnObject,
	BeAnyObject,
	IObjectWithTypegooseFunction
} from './$.js';

/**
	Used Internally for ModelTypes
*/
export type ModelType<T, QueryHelpers = BeAnObject> = mongoose.Model<
	T, // raw doc type
	QueryHelpers, // query helpers
	IObjectWithTypegooseFunction, // instance methods
	BeAnyObject // virtuals
>;

/**
	The Type for Models used in typegoose, mostly returned by "getModelForClass" and "addModelToTypegoose"
	@example
	const Model: ReturnModelType<typeof YourClass, YourClassQueryHelper> = mongoose.model("YourClass", YourClassSchema);
*/
export type ReturnModelType<
	U extends AnyParamConstructor<any>,
	QueryHelpers = BeAnObject
> = ModelType<InstanceType<U>, QueryHelpers> & U;
