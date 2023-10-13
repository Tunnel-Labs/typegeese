import { AssertionFallbackError, NoValidClassError } from '../errors/$.js';
import type { DeferredFunc, Func } from '@-/types';
import { isConstructor } from './typeguards.js';

/**
	Assert a condition, if "false" throw error
	Note: it is not named "assert" to differentiate between node and jest types
 *
	Note: "error" can be a function to not execute the constructor when not needed
	@param cond The Condition to check
	@param error A Custom Error to throw or a function that returns a Error
*/
export function assertion(
	cond: any,
	error?: Error | DeferredFunc<Error>
): asserts cond {
	if (!cond) {
		throw typeof error === 'function'
			? error()
			: error ?? new AssertionFallbackError();
	}
}

/**
	Assert if "val" is an function (constructor for classes)
	@param val Value to test
*/
export function assertionIsClass(val: any): asserts val is Func {
	assertion(isConstructor(val), () => new NoValidClassError(val));
}