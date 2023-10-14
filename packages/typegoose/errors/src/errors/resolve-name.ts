export class ResolveTypegooseNameError extends ReferenceError {
	constructor(input: unknown) {
		super(
			"Input was not a string AND didn't have a .typegooseName function AND didn't have a .typegooseName string [E014]\n" +
				`Value: "${toStringNoFail(input)}"`
		);
	}
}
