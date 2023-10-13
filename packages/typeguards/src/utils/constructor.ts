import type { AnyParamConstructor } from '@-/types';
import { isNullOrUndefined } from './null-or-undefined.js';

/**
	Is the provided input an class with an constructor?
	@param obj The Value to test
*/
export function isConstructor(obj: any): obj is AnyParamConstructor<any> {
	return (
		typeof obj === 'function' &&
		!isNullOrUndefined(obj.prototype?.constructor?.name)
		// TODO: maybe change to the following implementation, because it would be more correct, but would involve some refactoring
		// if the js environment is spec-compliant, then the following should always work
		// /^class\s/.test(Function.prototype.toString.call(obj))
	);
}
