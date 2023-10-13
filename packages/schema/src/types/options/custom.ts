import { Severity } from '../../enums/severity.js';
import type { CustomNameFunction, NestedDiscriminatorsFunction } from '../$.js';

/** Typegoose options, mostly for "modelOptions({ options: ICustomOptions })" */
export interface ICustomOptions {
	/**
		Set the modelName of the class.
		If it is a function, the function will be executed. The function will override
		"automaticName". If "automaticName" is true and "customName" is a string, it
		sets a *suffix* instead of the whole name.
		@default schemaOptions.collection
	*/
	customName?: string | CustomNameFunction;
	/**
		Enable Automatic Name generation of a model
		Example:
		class with name of "SomeClass"
		and option "collection" of "SC"
   *
		will generate the name of "SomeClass_SC"
		@default false
   */
	automaticName?: boolean;
	/** Allow "mongoose.Schema.Types.Mixed"? */
	allowMixed?: Severity;
	/**
		Enable Overwriting of the plugins on the "to-be" discriminator schema with the base schema's
		Note: this does not actually "merge plugins", it will overwrite the "to-be" discriminator's plugins with the base schema's
		If {@link ICustomOptions.enableMergePlugins} and {@link ICustomOptions.enableMergeHooks} are both "false", then the global plugins will be automatically applied by typegoose, see https://github.com/Automattic/mongoose/issues/12696
		@default false
   */
	enableMergePlugins?: boolean;
	/**
		Enable Merging of Hooks
		Note: only hooks that can be matched against each-other can be de-duplicated
		If {@link ICustomOptions.enableMergePlugins} and {@link ICustomOptions.enableMergeHooks} are both "false", then the global plugins will be automatically applied by typegoose, see https://github.com/Automattic/mongoose/issues/12696
		@default false
   */
	enableMergeHooks?: boolean;
	/**
		Disable all lower indexes than this class (works like `sch.clone().clearIndexes()`)
		@default false
   */
	disableLowerIndexes?: boolean;
	/**
		Set the Nested Discriminators on the *base* of the Discriminators
   *
		This option can be used over the prop-option to not have to re-define discriminators if used in multiple classes
   */
	discriminators?: NestedDiscriminatorsFunction;
	/**
		Disable Caching for this Class if defined via `@modelOptions`, or disable caching for the `getModelForClass` / `buildSchema` / `getDiscriminatorModelForClass`
		Does NOT overwrite global disabled caching
		"undefined" and "false" have the same meaning
		@default false
   */
	disableCaching?: boolean;
}
