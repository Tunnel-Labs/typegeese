import { toStringNoFail } from '../utils/to-string.js';

export class NotValidModelError extends TypeError {
	constructor(model: unknown, where: string) {
		super(
			`Expected "${where}" to be a valid mongoose.Model! (got: "${toStringNoFail(
				model
			)}") [E025]`
		);
	}
}
