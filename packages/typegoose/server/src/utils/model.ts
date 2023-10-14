import type { AnyParamConstructor, ReturnModelType } from '@-/types';
import { IModelOptions } from '@-/types';
import { BeAnObject } from '@-/types';
import { assertionIsClass } from '@-/shared';
import mongoose from 'mongoose';
import { mapModelOptionsToNaming } from './model-options.js';

/**
	Build a Model From a Class
	@param cl The Class to build a Model from
	@param options Overwrite Options, like for naming or general SchemaOptions the class gets compiled with
	@returns The finished Model
	@public
	@example
	```ts
	class ClassName {}
 *
	const NameModel = getModelForClass(ClassName);
	```
*/
export function getModelForClass<
	U extends AnyParamConstructor<any>,
	QueryHelpers = BeAnObject
>(cl: U, options?: IModelOptions) {
	assertionIsClass(cl);
	const rawOptions = typeof options === 'object' ? options : {};
	const overwriteNaming = mapModelOptionsToNaming(rawOptions); // use "rawOptions" instead of "mergedOptions" to consistently differentiate between classes & models

	const mergedOptions = getMergedModelOptions(rawOptions, cl);
	const name = getName(cl, overwriteNaming);

	if (
		isCachingEnabled(mergedOptions.options?.disableCaching) &&
		models.has(name)
	) {
		return models.get(name) as ReturnModelType<U, QueryHelpers>;
	}

	const modelFn =
		mergedOptions?.existingConnection?.model.bind(
			mergedOptions.existingConnection
		) ??
		mergedOptions?.existingMongoose?.model.bind(
			mergedOptions.existingMongoose
		) ??
		mongoose.model.bind(mongoose);

	const compiledModel: mongoose.Model<any> = modelFn(
		name,
		buildSchema(cl, mergedOptions)
	);

	return addModelToTypegoose<U, QueryHelpers>(compiledModel, cl, {
		existingMongoose: mergedOptions?.existingMongoose,
		existingConnection: mergedOptions?.existingConnection,
		disableCaching: mergedOptions.options?.disableCaching
	});
}

/**
	Get Model from internal cache
	@param key Model's name key
	@example
	```ts
	class ClassName {}
	getModelForClass(ClassName); // build the model
	const NameModel = getModelWithString<typeof ClassName>("ClassName");
	```
*/
export function getModelWithString<
	U extends AnyParamConstructor<any>,
	QueryHelpers = BeAnObject
>(key: string): undefined | ReturnModelType<U, QueryHelpers> {
	assertion(
		typeof key === 'string',
		() => new ExpectedTypeError('key', 'string', key)
	);
	assertion(
		isGlobalCachingEnabled(),
		() => new CacheDisabledError('getModelWithString')
	);

	return models.get(key) as any;
}
