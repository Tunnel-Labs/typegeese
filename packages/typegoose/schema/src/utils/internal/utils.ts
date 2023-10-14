import { intersection, mergeWith, omit } from 'lodash';
import * as mongoose from 'mongoose';
import { logger } from '../logSettings.js';
import type {
  AnyParamConstructor,
  DecoratedPropertyMetadataMap,
  DeferredFunc,
  Func,
  GetTypeReturn,
  IModelOptions,
  INamingOptions,
  IObjectWithTypegooseFunction,
  IPrototype,
  KeyStringAny,
  MappedInnerOuterOptions,
  PropOptionsForNumber,
  PropOptionsForString,
  VirtualOptions,
} from '../types.js';
import { AlreadyMerged, DecoratorKeys, Severity } from './constants.js';
import { constructors, globalOptions } from './data.js';
import {
  AssertionFallbackError,
  CacheDisabledError,
  InvalidOptionsConstructorError,
  NoValidClassError,
  ResolveTypegooseNameError,
  StringLengthExpectedError,
} from './errors.js';



/**
	Returns true, if the type is included in mongoose.Schema.Types except the aliases
	@param Type The Type to test
	@returns true, if it includes it
*/
export function isAnRefType(Type: any): boolean {
  if (typeof Type?.name === 'string') {
    // Note: this is not done "once" because types can be added as custom types
    const tmp = Object.getOwnPropertyNames(mongoose.Schema.Types).filter((x) => {
      switch (x) {
        case 'Oid':
        case 'Bool':
        case 'Object':
        case 'Boolean':
          return false;
        default:
          return true;
      }
    });

    // try to match "Type.name" with all the Property Names of "mongoose.Schema.Types" except the ones with aliases
    // (like "String" with "mongoose.Schema.Types.String")
    return (
      tmp.includes(Type.name) ||
      // try to match "Type.name" with all "mongoose.Schema.Types.*.name"
      // (like "SchemaString" with "mongoose.Schema.Types.String.name")
      Object.values(mongoose.Schema.Types).findIndex((v) => v.name === Type.name) >= 0
    );
  }

  return false;
}

/**
	Returns true, if it is an Object
	Looks down the prototype chain, unless "once" is set to "true"
	@param Type The Type to test
	@param once Set to not loop down the prototype chain, default "false"
	@returns true, if it is an Object
*/
export function isObject(Type: any, once: boolean = false): boolean {
  if (typeof Type?.name === 'string') {
    let prototype = Type.prototype;
    let name = Type.name;
    while (name) {
      if (name === 'Object' || name === 'Mixed') {
        return true;
      }
      if (once) {
        break;
      }

      prototype = Object.getPrototypeOf(prototype);
      name = prototype?.constructor.name;
    }
  }

  return false;
}


/**
	Get or init the Cached Schema
	@param target The Target to get / init the cached schema
	@returns The Schema to use
*/
export function getCachedSchema(target: AnyParamConstructor<any>): Record<string, mongoose.SchemaDefinition<unknown>> {
  let schemaReflectTarget = Reflect.getMetadata(DecoratorKeys.CachedSchema, target);

  if (isNullOrUndefined(schemaReflectTarget)) {
    Reflect.defineMetadata(DecoratorKeys.CachedSchema, {}, target);
    schemaReflectTarget = Reflect.getMetadata(DecoratorKeys.CachedSchema, target);
  } else if (isNullOrUndefined(Reflect.getOwnMetadata(DecoratorKeys.CachedSchema, target))) {
    // set own metadata and clone object, because otherwise on inheritance it would just modify the base class's object, not its own object
    schemaReflectTarget = { ...schemaReflectTarget };
    Reflect.defineMetadata(DecoratorKeys.CachedSchema, schemaReflectTarget, target);
  }

  return schemaReflectTarget;
}

/**
	Get the Class for a number of inputs
	@param input The Input to fetch the class from
*/
export function getClass(
  input: mongoose.Document | IObjectWithTypegooseFunction | { typegooseName: string } | string | any
): NewableFunction | undefined {
  assertion(isGlobalCachingEnabled(), () => new CacheDisabledError('getClass'));

  if (typeof input === 'string') {
    return constructors.get(input);
  }
  if (typeof input?.typegooseName === 'string') {
    return constructors.get(input.typegooseName);
  }

  if (typeof input?.typegooseName === 'function') {
    return constructors.get(input.typegooseName());
  }

  if (typeof input?.constructor?.modelName === 'string') {
    return constructors.get(input.constructor.modelName);
  }

  throw new ResolveTypegooseNameError(input);
}

/**
	Returns all options found in "options" that are String-validate related
	@param options The raw Options that may contain the wanted options
*/
export function isWithStringValidate(options: PropOptionsForString): string[] {
  return intersection(Object.keys(options), ['match', 'minlength', 'maxlength']);
}

/**
	Returns all options found in "options" that are String-transform related
	@param options The raw Options
*/
export function isWithStringTransform(options: PropOptionsForString): string[] {
  return intersection(Object.keys(options), ['lowercase', 'uppercase', 'trim']);
}

/**
	Returns all options found in "options" that are Number-Validate related
	@param options The raw Options
*/
export function isWithNumberValidate(options: PropOptionsForNumber): string[] {
  return intersection(Object.keys(options), ['min', 'max']);
}

/**
	Returns all options found in "options" that are Enum Related
	@param options The raw Options
*/
export function isWithEnumValidate(options: PropOptionsForNumber | PropOptionsForString): string[] {
  return intersection(Object.keys(options), ['enum']);
}


/**
	Check if all Required options for Virtual-Populate are included in "options"
	@param options The raw Options
*/
export function includesAllVirtualPOP(options: Partial<VirtualOptions>): options is VirtualOptions {
  return allVirtualoptions.every((v) => Object.keys(options).includes(v));
}

/**
	Used for lodash customizers (cloneWith, cloneDeepWith, mergeWith)
	@param key the key of the current object
	@param val the value of the object that should get returned for "existingMongoose" & "existingConnection"
*/
function customMerger(key: string | number, val: unknown): undefined | unknown {
  if (typeof key !== 'string') {
    return undefined;
  }
  if (/^(existingMongoose|existingConnection)$/.test(key)) {
    return val;
  }

  return undefined;
}

/**
	Merge only schemaOptions from ModelOptions of the class
	@param value The value to use
	@param cl The Class to get the values from
*/
export function mergeSchemaOptions<U extends AnyParamConstructor<any>>(value: mongoose.SchemaOptions | undefined, cl: U) {
  return mergeMetadata<IModelOptions>(DecoratorKeys.ModelOptions, { schemaOptions: value }, cl).schemaOptions;
}

/**
	Tries to return the right target
	if target.constructor.name is "Function", return "target", otherwise "target.constructor"
	@param target The target to determine
*/
export function getRightTarget(target: any): any {
  return target.constructor?.name === 'Function' ? target : target.constructor;
}

/**
	Get the Class's final name
	(combines all available options to generate a name)
	@param cl The Class to get the name for
	@param overwriteNaming Overwrite naming options used for generating the name
*/
export function getName<U extends AnyParamConstructor<any>>(cl: U, overwriteNaming?: INamingOptions) {
  // this case (cl being undefined / null) can happen when type casting (or type being "any") happened and wanting to throw a Error (and there using "getName" to help)
  // check if input variable is undefined, if it is throw a error (cannot be combined with the error below because of "getRightTarget")
  assertion(!isNullOrUndefined(cl), () => new NoValidClassError(cl));
  const ctor: any = getRightTarget(cl);
  assertion(isConstructor(ctor), () => new NoValidClassError(ctor));

  const options: IModelOptions = Reflect.getMetadata(DecoratorKeys.ModelOptions, ctor) ?? {};
  const baseName: string = ctor.name;
  const customName = overwriteNaming?.customName ?? options.options?.customName;

  if (typeof customName === 'function') {
    const name = customName(options);

    assertion(
      typeof name === 'string' && name.length > 0,
      () => new StringLengthExpectedError(1, name, baseName, 'options.customName(function)')
    );

    return name;
  }

  const automaticName = overwriteNaming?.automaticName ?? options.options?.automaticName;

  if (automaticName) {
    const suffix = customName ?? overwriteNaming?.schemaCollection ?? options.schemaOptions?.collection;

    return !isNullOrUndefined(suffix) ? `${baseName}_${suffix}` : baseName;
  }

  if (isNullOrUndefined(customName)) {
    return baseName;
  }

  assertion(
    typeof customName === 'string' && customName.length > 0,
    () => new StringLengthExpectedError(1, customName, baseName, 'options.customName')
  );

  return customName;
}

/**
	Check if "Type" is a class and if it is already in "schemas"
	@param Type The Type to check
*/
export function isNotDefined(Type: any) {
  return (
    typeof Type === 'function' &&
    !isPrimitive(Type) &&
    Type !== Object &&
    isNullOrUndefined(Reflect.getMetadata(DecoratorKeys.CachedSchema, Type))
  );
}

/**
	Map Options to "inner" & "outer"
	-> inner: means inner of "type: [{here})"
	-> outer: means outer of "type: [{}], here"
 *
	Specific to Arrays
	@param rawOptions The raw options
	@param Type The Type of the array
	@param target The Target class
	@param pkey Key of the Property
	@param loggerType Type to use for logging
	@param extraInner Extra Options to Mad explicitly to "inner"
*/
export function mapArrayOptions(
  rawOptions: any,
  Type: AnyParamConstructor<any> | mongoose.Schema,
  target: any,
  pkey: string,
  loggerType?: AnyParamConstructor<any>,
  extraInner?: KeyStringAny
): mongoose.SchemaTypeOptions<any> {
  logger.debug('mapArrayOptions called');
  loggerType = loggerType ?? (Type as AnyParamConstructor<any>);

  if (!(Type instanceof mongoose.Schema)) {
    loggerType = Type;
  }

  const dim = rawOptions.dim; // needed, otherwise it will be included (and not removed) in the returnObject
  delete rawOptions.dim;

  const mapped = mapOptions(rawOptions, Type, target, pkey, loggerType);

  /** The Object that gets returned */
  const returnObject: KeyStringAny = {
    ...mapped.outer,
    type: [
      {
        type: Type,
        ...mapped.inner,
        ...extraInner,
      },
    ],
  };

  rawOptions.dim = dim; // re-add for "createArrayFromDimensions"

  returnObject.type = createArrayFromDimensions(rawOptions, returnObject.type, getName(target), pkey);

  if (loggerType) {
    logger.debug('(Array) Final mapped Options for Type "%s"', getName(loggerType), returnObject);
  }

  return returnObject;
}

/**
	Check if the current Type is meant to be a Array
	@param rawOptions The raw options
*/
export function isTypeMeantToBeArray(rawOptions: any): boolean {
  // check if the "dim" option exists, if yes the type is meant to be a array in the end
  return !isNullOrUndefined(rawOptions) && !isNullOrUndefined(rawOptions.dim) && typeof rawOptions.dim === 'number' && rawOptions.dim > 0;
}

/**
	Warn, Error or Allow if an mixed type is set
	-> this function exists for de-duplication
	@param target Target Class
	@param key Property key
*/
export function warnMixed(target: any, key: string): void | never {
  const name = getName(target);
  const modelOptions: IModelOptions = Reflect.getMetadata(DecoratorKeys.ModelOptions, getRightTarget(target)) ?? {};
  const rawOptions = Reflect.getMetadata(DecoratorKeys.PropCache, target) as DecoratedPropertyMetadataMap | undefined;

  const setSeverity: Severity = rawOptions?.get(key)?.options?.allowMixed ?? modelOptions.options?.allowMixed ?? Severity.WARN;

  logger.debug(`setSeverity for "${name}.${key}" is "${setSeverity}"`);

  switch (setSeverity) {
    default:
    case Severity.WARN:
      logger.warn(
        'Setting "Mixed" for property "%s.%s"\nLook here for how to disable this message: https://typegoose.github.io/typegoose/docs/api/decorators/model-options/#allowmixed',
        name,
        key
      );

      break;
    case Severity.ALLOW:
      break;
    case Severity.ERROR:
      throw new TypeError(`Setting "Mixed" is not allowed! (${name}, ${key}) [E017]`);
  }

  return; // always return, if "allowMixed" is not "ERROR"
}

/**
	Loop over "dimensions" and create an array from that
	@param rawOptions baseProp's rawOptions
	@param extra What is actually in the deepest array
	@param name name of the target for better error logging
	@param key key of target-key for better error logging
*/
export function createArrayFromDimensions(rawOptions: any, extra: any, name: string, key: string) {
  // dimensions start at 1 (not 0)
  const dim = typeof rawOptions.dim === 'number' ? rawOptions.dim : 1;

  if (dim < 1) {
    throw new RangeError(`"dim" needs to be higher than 0 (${name}.${key}) [E018]`);
  }

  delete rawOptions.dim; // delete this property to not actually put it as an option
  logger.info('createArrayFromDimensions called with %d dimensions', dim);

  let retArray: any[] = Array.isArray(extra) ? extra : [extra];
  // index starts at 1 because "retArray" is already once wrapped in an array
  for (let index = 1; index < dim; index++) {
    retArray = [retArray];
  }

  return retArray as any[];
}


/**
	Get Type, if input is an arrow-function, execute it and return the result
	@param typeOrFunc Function or Type
	@param returnLastFoundArray Return the last found array (used for something like PropOptions.discriminators)
*/
export function getType(typeOrFunc: Func | any, returnLastFoundArray: boolean = false): GetTypeReturn {
  const returnObject: GetTypeReturn = {
    type: typeOrFunc,
    dim: 0,
  };

  if (typeof returnObject.type === 'function' && !isConstructor(returnObject.type)) {
    returnObject.type = (returnObject.type as Func)();
  }

  function getDepth(): void {
    if (returnObject.dim > 100) {
      // this is arbitrary, but why would anyone have more than 10 nested arrays anyway?
      throw new Error('getDepth recursed too much (dim > 100)');
    }
    if (Array.isArray(returnObject.type)) {
      returnObject.dim++;

      if (returnLastFoundArray && !Array.isArray(returnObject.type[0])) {
        return;
      }

      returnObject.type = returnObject.type[0];
      getDepth();
    }
  }

  getDepth();

  logger.debug('Final getType: dim: %s, type:', returnObject.dim, returnObject.type);

  return returnObject;
}


// /**
// 	Execute util.deprecate or when "process" does not exist use "console.log"
// 	(if "process" does not exist, the codes are not cached, and are always logged again)
// 	This Function is here to try to make typegoose compatible with the browser (see https://github.com/typegoose/typegoose/issues/33)
//  */
// eslint-disable-next-line @typescript-eslint/ban-types
// export function deprecate<T extends Function>(fn: T, message: string, code: string): T {
//   if (!isNullOrUndefined(process)) {
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     return require('util').deprecate(fn, message, code);
//   }

//   console.log(`[${code}] DeprecationWarning: ${message}`);

//   return fn;
// }

/**
	Logs an warning if "included > 0" that the options of not the current type are included
	@param name Name of the Class
	@param key Name of the Currently Processed key
	@param type Name of the Expected Type
	@param extra Extra string to be included
	@param included Included Options to be listed
*/
export function warnNotCorrectTypeOptions(name: string, key: string, type: string, extra: string, included: string[]): void {
  // this "if" is in this function to de-duplicate code
  if (included.length > 0) {
    logger.warn(
      `Type of "${name}.${key}" is not ${type}, but includes the following ${extra} options [W001]:\n` + `  [${included.join(', ')}]`
    );
  }
}

/**
	Logs a warning for Discriminator setting a different "existing*" property than the base
	@param fromName Name of the Base Model
	@param clName Name of the Discriminator's class
	@param property The property defined that does not match
*/
export function warnNotMatchingExisting(fromName: string, clName: string, property: string) {
  logger.warn(
    `Property "${property}" was defined on "${clName}", but is different from discriminator base "${fromName}", which is not supported! [W002]`
  );
}


/**
	Helper function to check if caching is enabled globally
	@returns "true" if caching is enabled or "false" if disabled
*/
export function isGlobalCachingEnabled(): boolean {
  return !(globalOptions.globalOptions?.disableGlobalCaching === true);
}

/**
	Helper function to check if caching is enabled globally AND by options
	@param opt The caching option (from IModelOptions)
	@returns "true" if caching is enabled or "false" if disabled
*/
export function isCachingEnabled(opt: boolean | undefined): boolean {
  return isGlobalCachingEnabled() && !(opt === true);
}
