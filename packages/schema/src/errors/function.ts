export class FunctionCalledMoreThanSupportedError extends Error {
	constructor(functionName: string, supported: number, extra: string) {
		super(
			`Function "${functionName}" only supports to be called "${supported}" times with the same parameters [E003]\n${extra}`
		);
	}
}

export class NoDiscriminatorFunctionError extends Error {
	constructor(name: string, key: string) {
		super(
			`Path "${name}.${key}" does not have a function called "discriminator"! (Nested Discriminator cannot be applied) [E031]`
		);
	}
}
