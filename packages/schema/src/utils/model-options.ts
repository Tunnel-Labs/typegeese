import { DecoratorKeys } from '../enums/decorator-keys.js';
import { assignGlobalModelOptions, assignMetadata } from './internal/utils.js';
import type { IModelOptions } from '@typegeese/types'

/**
	Define Options for the Class
	@param options The Options to set
	@example Example:
	```ts
	@modelOptions({ schemaOptions: { timestamps: true } })
	class ClassName {}
 *
	// The default Class "TimeStamps" can be used for type information and options already set
	```
*/
export function modelOptions(options: IModelOptions): ClassDecorator {
  return (target: any) => {
    assignGlobalModelOptions(target);
    assignMetadata(DecoratorKeys.ModelOptions, options, target);
  };
}

// Export it PascalCased
export { modelOptions as ModelOptions };

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
export function getMergedModelOptions(rawOptions: IModelOptions | undefined, cl: AnyParamConstructor<any>): IModelOptions {
  const opt = typeof rawOptions === 'object' ? rawOptions : {};

  if (assignGlobalModelOptions(cl)) {
    opt[AlreadyMerged] = false;
  }

  const mergedOptions: IModelOptions = opt?.[AlreadyMerged] ? opt : mergeMetadata(DecoratorKeys.ModelOptions, rawOptions, cl);
  mergedOptions[AlreadyMerged] = true;

  return mergedOptions;
}

/**
	Assign Global ModelOptions if not already existing
	@param target Target Class
	@returns "true" when it assigned options
*/
export function assignGlobalModelOptions(target: any): boolean {
  if (isNullOrUndefined(Reflect.getMetadata(DecoratorKeys.ModelOptions, target))) {
    logger.info('Assigning global Schema Options to "%s"', getName(target));
    assignMetadata(DecoratorKeys.ModelOptions, omit(globalOptions, 'globalOptions'), target);

    return true;
  }

  return false;
}
