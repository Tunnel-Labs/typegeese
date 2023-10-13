import { toStringNoFail } from '../utils/to-string.js';

export class InvalidOptionsConstructorError extends TypeError {
	constructor(name: string, key: string, type: unknown) {
		super(
			`Type has a invalid "OptionsConstructor" on "${name}.${key}"! [E016]\n` +
				`Type: "${toStringNoFail(type)}"`
		);
	}
}

export class DuplicateOptionsError extends TypeError {
	constructor(duplicateAt: string[]) {
		super(`Duplicate Option definition at [${duplicateAt.join(',')}] [E032]`);
	}
}

export class OptionDoesNotSupportOptionError extends TypeError {
	constructor(
		currentOption: string,
		problemOption: string,
		expected: string,
		provided: string
	) {
		super(
			`The Option "${currentOption}" does not support Option "${problemOption}" other than "${expected}" (provided was: "${provided}") [E027]`
		);
	}
}

export class RefOptionIsUndefinedError extends Error {
	constructor(name: string, key: string) {
		super(
			`Prop-Option "ref"'s value is "null" or "undefined" for "${name}.${key}" [E005]`
		);
	}
}
