// This line is needed in order to prevent "type not portable" errors
export type * from '@typegoose/typegoose/lib/types.js'
export type { CreateInput } from "./types/create.js";
export type { OnForeignModelDeletedActions } from "./types/delete.js";
export type { Deprecated } from "./types/deprecated.js";
export type { FindInput } from "./types/find.js";
export type { Ref } from "./types/ref.js";
export type { ForeignRef, ModelRef, VirtualForeignRef } from "./types/refs.js";
export type { SelectInput, SelectOutput } from "./types/select.js";
export type {
  ExpandMapping,
  InferSelectionDefinition,
  RecursivelyExpandSelection,
  SelectionContext,
  SelectionDefinition,
  SelectionSelect,
  WithOptions,
} from "./types/selections.js";
export { defineOnForeignModelDeletedActions } from "./utils/delete.js";
export { deprecated } from "./utils/deprecated.js";
export { defineMigration } from "./utils/migration.js";
export { ModelSchema } from "./utils/model.js";
export { useForeignRefs } from "./utils/ref.js";
export { loadAugmentedSchemas } from "./utils/schema.js";
export { applySelect } from "./utils/select.js";
export {
  createSelectionFunction,
  defineSelectionMappings,
  expandSelections,
} from "./utils/selection.js";
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
  errors,
  // We deliberately don't re-export `Ref` because we wrap around it
  // Ref
} from "@typegoose/typegoose";
