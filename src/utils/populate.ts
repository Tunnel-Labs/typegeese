import { PopulateObject } from "~/types/populate.js";

export function recursivelyAddSelectVersionToPopulateObject(
  populateObject: PopulateObject
) {
  if (populateObject.select !== undefined) {
    if (typeof populateObject.select !== "object") {
      throw new Error(
        "Non-object arguments for `populate#select` is not yet supported"
      );
    }

    populateObject.select._version = 1;
  }

  if (populateObject.populate !== undefined) {
    for (const nestedPopulateObject of populateObject.populate) {
      recursivelyAddSelectVersionToPopulateObject(nestedPopulateObject);
    }
  }
}
