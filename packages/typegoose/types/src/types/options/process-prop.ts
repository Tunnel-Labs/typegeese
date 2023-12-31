import type { AnyParamConstructor, DecoratedPropertyMetadata } from '../$.js';

/** Options used for "processProp" */
export interface ProcessPropOptions extends DecoratedPropertyMetadata {
	/** The target Class's static version */
	cl: AnyParamConstructor<any>;
}
