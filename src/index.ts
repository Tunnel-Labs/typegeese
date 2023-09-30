// This line is needed in order to prevent "type not portable" errors
export type * from '@typegoose/typegoose/lib/types.js';

export type * from './types/array.js';
export type * from './types/create.js';
export type * from './types/delete.js';
export type * from './types/deprecated.js';
export type * from './types/find.js';
export type * from './types/hyperschema.js';
export type * from './types/instance-type.js';
export type * from './types/migration.js';
export type { Ref } from './types/ref.js';
export type * from './types/refs.js';
export type * from './types/schema.js';
export type * from './types/select.js';
export type * from './types/t/$.js';
export type * from './types/query.js';

export { BaseSchema } from './classes/$.js';
export { defineOnForeignModelDeletedActions } from './utils/delete.js';
export { defineSchemaOptions, Schema } from './utils/schema.js';
export { deprecated } from './utils/deprecated.js';
export { loadHyperschemas, normalizeHyperschema } from './utils/hyperschema.js';
export { createMigration } from './utils/migration.js';
export { getModelForHyperschema } from './utils/model.js';
export { useForeignRefs } from './utils/ref.js';
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
