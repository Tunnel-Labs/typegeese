export class PathNotInSchemaError extends Error {
	constructor(name: string, key: string) {
		super(`Path "${key}" on "${name}" does not exist in the Schema! [E030]`);
	}
}
