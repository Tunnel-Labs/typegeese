/* exports */
// export the internally used "mongoose", to not need to always import it
export { mongoose, setGlobalOptions };
export { setLogLevel, LogLevels } from './utils/log-settings.js';
export * from './prop.js';
export * from './hooks.js';
export * from './plugin.js';
export * from './indexes.js';
export * from './modelOptions.js';
export * from './queryMethod.js';
export * from './typeguards.js';
export * as defaultClasses from './defaultClasses.js';
export * as errors from './internal/errors.js';
export * as types from './types.js';
// the following types are re-exported (instead of just in "types") because they are often used types
export {
	DocumentType,
	Ref,
	ReturnModelType,
	SubDocumentType,
	ArraySubDocumentType
};
export { getClass, getName } from './internal/utils.js';
export { Severity, PropType } from './internal/constants.js';

parseENV(); // call this before anything to ensure they are applied
