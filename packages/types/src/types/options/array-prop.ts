import type { InnerOuterOptions } from './inner-outer.js';
import type { BasePropOptions } from './base-prop.js';

/** Options for Array's */
export interface ArrayPropOptions extends BasePropOptions, InnerOuterOptions {
	/**
		How many dimensions this Array should have (needs to be higher than 0)

		Note: Custom Typegoose Option
		@default 1
	*/
	dim?: number;
	/**
		Set if Non-Array values will be cast to an array

		NOTE: This option currently only really affects "DocumentArray" and not normal arrays, https://github.com/Automattic/mongoose/issues/10398
		@see https://mongoosejs.com/docs/api/schemaarray.html#schemaarray_SchemaArray.options

		@example ```ts
		new Model({ array: "string" });
		// will be cast to equal
		new Model({ array: ["string"] });
		```
		@default true
	*/
	castNonArrays?: boolean;
}
