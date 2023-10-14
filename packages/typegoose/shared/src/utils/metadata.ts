import { AnyParamConstructor } from '@-/types';

/**
	Merge "value" with existing Metadata and save it to the class
	Difference with "mergeMetadata" is that this one DOES save it to the class
	Overwrites any existing Metadata that is new in "value"
	@param key Metadata key to read from and assign the new value to
	@param value Options to merge with
	@param cl The Class to read and assign the new metadata to
	@internal
*/
export function assignMetadata(
	key: DecoratorKeys,
	value: unknown,
	cl: AnyParamConstructor<any>
): any {
	if (isNullOrUndefined(value)) {
		return value;
	}

	const newValue = mergeMetadata(key, value, cl);
	Reflect.defineMetadata(key, newValue, cl);

	return newValue;
}

/**
	Merge "value" with existing Metadata
	Difference with "assignMetadata" is that this one DOES NOT save it to the class
	Overwrites any existing Metadata that is new in "value"
	@param key Metadata key to read existing metadata from
	@param value Option to merge with
	@param cl The Class to read the metadata from
	@returns Returns the merged output, where "value" overwrites existing Metadata values
	@internal
*/
export function mergeMetadata<T = any>(
	key: DecoratorKeys,
	value: unknown,
	cl: AnyParamConstructor<any>
): T {
	assertion(
		typeof key === 'string' && key.length > 0,
		() => new StringLengthExpectedError(1, key, getName(cl), 'key')
	);
	assertionIsClass(cl);

	// Please don't remove the other values from the function, even when unused - it is made to be clear what is what
	return mergeWith(
		{},
		Reflect.getMetadata(key, cl),
		value,
		(_objValue, srcValue, ckey) => customMerger(ckey, srcValue)
	);
}
