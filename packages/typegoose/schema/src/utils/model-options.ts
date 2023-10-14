import { DecoratorKeys } from '../enums/decorator-keys.js';
import { assignGlobalModelOptions, assignMetadata } from './internal/utils.js';
import type { IModelOptions } from '@-/types'

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
