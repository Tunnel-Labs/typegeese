import type { PopulateObject } from '@typegeese/types';

export function recursivelyAddSelectVersionToPopulateObject(
	populateObject: PopulateObject
) {
	if (populateObject.select !== undefined) {
		if (typeof populateObject.select !== 'object') {
			throw new Error(
				'Non-object arguments for `populate#select` is not yet supported'
			);
		}

		// Note that this "1" just tells mongoose to select the field (it doesn't actually set the _v field to 1)
		populateObject.select._v = 1;
	}

	if (populateObject.populate !== undefined) {
		for (const nestedPopulateObject of populateObject.populate) {
			recursivelyAddSelectVersionToPopulateObject(nestedPopulateObject);
		}
	}
}
