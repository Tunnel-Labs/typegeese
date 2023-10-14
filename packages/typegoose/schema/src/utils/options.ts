
/**
	Map Options to "inner" & "outer"
	@param rawOptions The raw options
	@param Type The Type of the array
	@param target The Target class
	@param pkey Key of the Property
	@param loggerType Type to use for logging
*/
export function mapOptions(
  rawOptions: any,
  Type: AnyParamConstructor<any> | (mongoose.Schema & IPrototype),
  target: any,
  pkey: string,
  loggerType?: AnyParamConstructor<any>
): MappedInnerOuterOptions {
  logger.debug('mapOptions called');
  loggerType = loggerType ?? (Type as AnyParamConstructor<any>);

  /** The Object that gets returned */
  const ret: MappedInnerOuterOptions = {
    inner: {},
    outer: {},
  };

  // if Type is not a Schema, try to convert js type to mongoose type (Object => Mixed)
  if (!(Type instanceof mongoose.Schema)) {
    // set the loggerType to the js type
    loggerType = Type;
    const loggerTypeName = getName(loggerType);

    if (loggerTypeName in mongoose.Schema.Types) {
      logger.info('Converting "%s" to mongoose Type', loggerTypeName);
      Type = mongoose.Schema.Types[loggerTypeName];

      if (Type === mongoose.Schema.Types.Mixed) {
        warnMixed(target, pkey);
      }
    }
  }

  if (isNullOrUndefined(loggerType)) {
    logger.info('mapOptions loggerType is undefined!');
  }

  /** The OptionsConstructor to use */
  let OptionsCTOR: undefined | mongoose.SchemaTypeOptions<any> = Type?.prototype?.OptionsConstructor;

  if (Type instanceof mongoose.Schema) {
    OptionsCTOR = mongoose.Schema.Types.Subdocument.prototype.OptionsConstructor;
  }

  assertion(!isNullOrUndefined(OptionsCTOR), () => new InvalidOptionsConstructorError(getName(target), pkey, loggerType));

  const options = Object.assign({}, rawOptions); // for sanity

  if (OptionsCTOR.prototype instanceof mongoose.SchemaTypeOptions) {
    for (const [key, value] of Object.entries(options)) {
      if (Object.getOwnPropertyNames(OptionsCTOR.prototype).includes(key)) {
        ret.inner[key] = value;
      } else {
        ret.outer[key] = value;
      }
    }
  } else {
    if (loggerType) {
      logger.info('The Type "%s" has a property "OptionsConstructor" but it does not extend "SchemaTypeOptions"', getName(loggerType));
    }

    ret.outer = options;
  }

  if (typeof options?.innerOptions === 'object') {
    delete ret.outer.innerOptions;
    for (const [key, value] of Object.entries(options.innerOptions)) {
      ret.inner[key] = value;
    }
  }
  if (typeof options?.outerOptions === 'object') {
    delete ret.outer.outerOptions;
    for (const [key, value] of Object.entries(options.outerOptions)) {
      ret.outer[key] = value;
    }
  }

  if (loggerType) {
    logger.debug('Final mapped Options for Type "%s"', getName(loggerType), ret);
  }

  return ret;
}
