/* exports */
// export the internally used "mongoose", to not need to always import it
export { mongoose, setGlobalOptions };
export { setLogLevel, LogLevels } from './utils/log-settings.js';
export * from './prop';
export * from './hooks';
export * from './plugin';
export * from './indexes';
export * from './modelOptions';
export * from './queryMethod';
export * from './typeguards';
export * as defaultClasses from './defaultClasses';
export * as errors from './internal/errors';
export * as types from './types';
// the following types are re-exported (instead of just in "types") because they are often used types
export {
	DocumentType,
	Ref,
	ReturnModelType,
	SubDocumentType,
	ArraySubDocumentType
};
export { getClass, getName } from './internal/utils';
export { Severity, PropType } from './internal/constants';

parseENV(); // call this before anything to ensure they are applied
