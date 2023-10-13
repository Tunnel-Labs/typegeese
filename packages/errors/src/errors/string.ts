export class StringLengthExpectedError extends TypeError {
	constructor(length: number, got: any, where: string, valueName: string) {
		// create the "got:" message, when string say it was a string, but not the length
		// if not string, then say it is not a string plus the value
		const gotMessage =
			typeof got === 'string'
				? `(String: "${got.length}")`
				: `(not-String: "${toStringNoFail(got)}")`;

		super(
			`Expected "${valueName}" to have at least length of "${length}" (got: ${gotMessage}, where: "${where}") [E026]`
		);
	}
}
