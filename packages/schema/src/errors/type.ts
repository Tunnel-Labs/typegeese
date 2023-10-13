// Note: don't forget to use "toStringNoFail" on values that are "unknown" or "any"

export class InvalidTypeError extends Error {
	constructor(targetName: string, key: string, Type: unknown) {
		super(
			`"${targetName}.${key}"'s Type is invalid! Type is: "${toStringNoFail(
				Type
			)}" [E009]`
		);
	}
}

export class NotNumberTypeError extends Error {
	constructor(
		targetName: string,
		key: string,
		enumKey: string,
		enumValue: string
	) {
		super(
			`Typeof "${targetName}.${key}" is "Number", value is undefined/null or does not have a reverse mapping! [E011]\n` +
				`  Encountered with property: "${enumKey}.${typeof enumValue}"`
		);
	}
}

export class NotStringTypeError extends Error {
	constructor(
		targetName: string,
		key: string,
		enumKey: string,
		enumValue: string
	) {
		super(
			`Typeof "${targetName}.${key}" is "String", used enum is not only Strings! [E010]\n` +
				`  Encountered with property in Enum: "${enumKey}.${typeof enumValue}"`
		);
	}
}

export class ExpectedTypeError extends TypeError {
	constructor(optionName: string, expected: string, got: unknown) {
		super(
			`Expected Argument "${optionName}" to have type "${expected}", got: "${toStringNoFail(
				got
			)}" [E029]`
		);
	}
}

export class InvalidEnumTypeError extends TypeError {
	constructor(name: string, key: string, value: unknown) {
		super(
			`Invalid Type used for options "enum" at "${name}.${key}"! [E012]\n` +
				`Type: "${toStringNoFail(value)}"\n` +
				'https://typegoose.github.io/typegoose/docs/guides/error-warning-details#invalid-type-for-enum-e012'
		);
	}
}

/** Error for when an unknown PropType is passed to an switch, gets thrown in the default case */
export class InvalidPropTypeError extends Error {
	constructor(proptype: unknown, name: string, key: string, where: string) {
		super(
			`"${toStringNoFail(
				proptype
			)}"(${where}) is invalid for "${name}.${key}" [E013]`
		);
	}
}
