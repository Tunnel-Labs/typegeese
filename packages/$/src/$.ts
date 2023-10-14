export type { Ref } from '@typegeese/types';
export type * from '@typegeese/types';

// This line is needed in order to prevent "type not portable" errors
export type * from '@typegoose/typegoose/lib/types.js';

export { defineSchemaOptions, Schema } from './utils/schema.js';
export {
	createHyperschema,
	registerActiveHyperschemas
} from './utils/hyperschema.js';
export { normalizeHyperschemaModule } from './utils/hyperschema-module.js';
export { getModelForSchema } from './utils/model.js';
export { foreignRef, virtualForeignRef } from './utils/ref.js';
export { select, select as applySelect } from './utils/select.js';

export {
	prop,
	pre,
	post,
	buildSchema,
	modelOptions,
	setLogLevel,
	setGlobalOptions,
	isRefType,
	isDocument,
	isModel,
	isDocumentArray,
	isRefTypeArray,
	deleteModel,
	deleteModelWithClass,
	addModelToTypegoose,
	index,
	plugin,
	queryMethod,
	getDiscriminatorModelForClass,
	getClass,
	getModelForClass,
	getModelWithString,
	getName,
	Index,
	ModelOptions,
	Plugins,
	Prop,
	PropType,
	LogLevels,
	Passthrough,
	Post,
	Pre,
	Severity,
	type ReturnModelType,
	type ArraySubDocumentType,
	type DocumentType,
	QueryMethod,
	type SubDocumentType,
	defaultClasses,
	errors
	// We deliberately don't re-export `Ref` because we wrap around it
	// Ref
} from '@typegoose/typegoose';
