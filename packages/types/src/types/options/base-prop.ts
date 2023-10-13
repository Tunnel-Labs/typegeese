import type * as mongoose from 'mongoose';
import type {
	EnumCombinedType,
	DeferredFunc,
	EnumValues,
	AnyParamConstructor,
	DynamicStringFunc,
	KeyStringAny,
	NestedDiscriminatorsFunction
} from '../$.js';
import { Severity } from '@-/enums';

/**
	This Interface for most properties uses "mongoose.SchemaTypeOptions<any>['']", but for some special (or typegoose custom) options, it is not used
 *
	Example: `index` is directly from mongoose, where as `type` is from typegoose
*/
export interface BasePropOptions {
	/**
		include this value?
		@default true (Implicitly)
	 */
	select?: mongoose.SchemaTypeOptions<any>['select'];
	/**
		is this value required?
		@default false (Implicitly)
	 */
	required?: mongoose.SchemaTypeOptions<any>['required'];
	/** Only accept Values from the Enum(|Array) */
	enum?:
		| EnumCombinedType
		| DeferredFunc<EnumCombinedType>
		| { values: DeferredFunc<EnumValues>; message?: string };
	/**
		Add "null" to the enum array
		Note: Custom Typegoose Option
	 */
	addNullToEnum?: boolean;
	/**
		Set Custom "warnMixed" Severity for a specific property
		Overwrites Severity set in "modelOptions" for a specific property
		Note: Custom Typegoose Option
	 */
	allowMixed?: Severity;
	/** Give the Property a default Value */
	default?: mongoose.SchemaTypeOptions<any>['default']; // I know this one does not have much of an effect, because of "any"
	/** Give a Validator RegExp or Function */
	validate?: mongoose.SchemaTypeOptions<any>['validate'];
	/**
		Should this property have a "unique" index?
		@link https://docs.mongodb.com/manual/indexes/#unique-indexes
	 */
	unique?: mongoose.SchemaTypeOptions<any>['unique'];
	/**
		Should this property have an index?
		Note: don't use this if you want to do a compound index
		@link https://docs.mongodb.com/manual/indexes
	 */
	index?: mongoose.SchemaTypeOptions<any>['index'];
	/**
		Should this property have a "sparse" index?
		@link https://docs.mongodb.com/manual/indexes/#sparse-indexes
	 */
	sparse?: mongoose.SchemaTypeOptions<any>['sparse'];
	/**
		Should this property have an "expires" index?
		@link https://docs.mongodb.com/manual/tutorial/expire-data
	 */
	expires?: mongoose.SchemaTypeOptions<any>['expires'];
	/**
		Should this property have a "text" index?
		@link https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-text
	 */
	text?: mongoose.SchemaTypeOptions<any>['text'];
	/** Should subdocuments get their own id?
		@default true (Implicitly)
	 */
	_id?: mongoose.SchemaTypeOptions<any>['_id'];
	/**
		Set a Setter (Non-Virtual) to pre-process your value
		(when using get/set both are required)
		Please note that the option `type` is required, if get/set saves a different value than what is defined
		@param value The Value that needs to get modified
		@returns The Value, but modified OR anything
		@example
		```ts
		function setHello(val: string): string {
		  return val.toLowerCase()
		}
		function getHello(val: string): string {
		  return val.toUpperCase();
		}
		class Dummy {
		  @prop({ set: setHello, get: getHello }) // many options can be used, like required
		  public hello: string;
		}
		```
	 */
	set?: mongoose.SchemaTypeOptions<any>['set'];
	/**
		Set a Getter (Non-Virtual) to Post-process your value
		(when using get/set both are required)
		Please note that the option `type` is required, if get/set saves a different value than what is defined
		@param value The Value that needs to get modified
		@returns The Value, but modified OR anything
		@example
		```ts
		function setHello(val: string): string {
		  return val.toLowerCase()
		}
		function getHello(val: string): string {
		  return val.toUpperCase();
		}
		class Dummy {
		  @prop({ set: setHello, get: getHello }) // many options can be used, like required
		  public hello: string;
		}
		```
	 */
	get?: mongoose.SchemaTypeOptions<any>['get'];
	/**
		This may be needed if get/set is used
		(this sets the type how it is saved to the DB)
	 */
	type?:
		| DeferredFunc<AnyParamConstructor<any>>
		| DeferredFunc<unknown>
		| unknown;
	/**
		Make a property read-only
		@example
		```ts
		class SomeClass {
		 @prop({ immutable: true })
		 public someprop: Readonly<string>;
		}
		```
	 */
	immutable?: mongoose.SchemaTypeOptions<any>['immutable'];
	/**
		Give the Property an alias in the output
	 *
		Note: you should include the alias as a variable in the class, but not with a prop decorator
		@example
		```ts
		class Dummy {
		  @prop({ alias: "helloWorld" })
		  public hello: string; // normal, with @prop
		  public helloWorld: string; // is just for type Completion, will not be included in the DB
		}
		```
	 */
	alias?: mongoose.SchemaTypeOptions<any>['alias'];
	/**
		This option as only an effect when the plugin `mongoose-autopopulate` is used
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	autopopulate?: boolean | Function | KeyStringAny;
	/** Reference another Document (you should use Ref<T> as Prop type) */
	ref?:
		| DeferredFunc<string | AnyParamConstructor<any> | DynamicStringFunc<any>>
		| string
		| AnyParamConstructor<any>;
	/** Take the Path and try to resolve it to a Model */
	refPath?: string;
	/**
		Set the Nested Discriminators
	 *
		Note: "_id: false" as a prop option doesn't work here
	 *
		Note: Custom Typegoose Option
	 */
	discriminators?: NestedDiscriminatorsFunction;
	/**
		Use option {@link BasePropOptions.type}
		@see https://typegoose.github.io/typegoose/docs/api/decorators/prop#map-options
		@see https://typegoose.github.io/typegoose/docs/api/decorators/prop#proptype
	 */
	of?: never;
	/**
		If true, uses Mongoose's default `_id` settings. Only allowed for ObjectIds
	 *
		Note: Copied from mongoose's "index.d.ts"#SchemaTypeOptions
	 */
	auto?: mongoose.SchemaTypeOptions<any>['auto'];
	/**
		The default [subtype](http://bsonspec.org/spec.html) associated with this buffer when it is stored in MongoDB. Only allowed for buffer paths
	 *
		Note: Copied from mongoose's "index.d.ts"#SchemaTypeOptions
	 */
	subtype?: mongoose.SchemaTypeOptions<any>['subtype'];
	/**
		If `true`, Mongoose will skip gathering indexes on subpaths. Only allowed for subdocuments and subdocument arrays.
	 *
		Note: Copied from mongoose's "index.d.ts"#SchemaTypeOptions
	 */
	excludeIndexes?: mongoose.SchemaTypeOptions<any>['excludeIndexes'];
	/**
		Define a transform function for this individual schema type.
		Only called when calling `toJSON()` or `toObject()`.
	 *
		Note: Copied from mongoose's "index.d.ts"#SchemaTypeOptions
	 */
	transform?: mongoose.SchemaTypeOptions<any>['transform'];

	// for plugins / undocumented types
	[extra: string]: any;
}
