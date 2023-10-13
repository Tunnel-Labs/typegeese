export class CannotBeSymbolError extends Error {
	constructor(name: string, key: string | symbol) {
		super(
			`A property key in Typegoose cannot be an symbol! ("${name}.${toStringNoFail(
				key
			)}") [E024]`
		);
	}
}
