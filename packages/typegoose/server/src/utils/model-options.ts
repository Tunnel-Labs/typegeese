import {
	AnyParamConstructor,
	IModelOptions,
	INamingOptions
} from '@-/types';
import { isNullOrUndefined } from '@-/shared';

/**
	Map options from {@link IModelOptions} to {@link INamingOptions}
	@param options The options to map
	@returns Always a object, contains mapped options from {@link IModelOptions}
*/
export function mapModelOptionsToNaming(
	options: IModelOptions | undefined
): INamingOptions {
	const mappedNaming: INamingOptions = { ...options?.options }; // this copies more than necessary, but works because most of the options are from there

	if (!isNullOrUndefined(options?.schemaOptions?.collection)) {
		mappedNaming.schemaCollection = options?.schemaOptions?.collection;
	}

	return mappedNaming;
}

/**
	Consistently get the "ModelOptions", merged with (the following is the order in which options are applied):
	1. globalOptions if unset
	2. decorator ModelOptions
	3. input "rawOptions"
 *
	Note: applies global options to the decorator options if unset, but does not set the final options
	@param rawOptions Options to merge(-overwrite) all previous options
	@param cl The Class to get / set the ModelOptions on
	@returns A ModelOptions object
*/
export function getMergedModelOptions(
	rawOptions: IModelOptions | undefined,
	cl: AnyParamConstructor<any>
): IModelOptions {
	const opt = typeof rawOptions === 'object' ? rawOptions : {};

	if (assignGlobalModelOptions(cl)) {
		opt[AlreadyMerged] = false;
	}

	const mergedOptions: IModelOptions = opt?.[AlreadyMerged]
		? opt
		: mergeMetadata(DecoratorKeys.ModelOptions, rawOptions, cl);
	mergedOptions[AlreadyMerged] = true;

	return mergedOptions;
}
