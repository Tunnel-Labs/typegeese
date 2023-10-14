/**
	Check if "val" is "null" to "undefined"
	This Function exists because since node 4.0.0 the internal util.is* functions got deprecated
	@param val Any value to test if null or undefined
*/
export function isNullOrUndefined(val: unknown): val is null | undefined {
	return val === null || val === undefined;
}
