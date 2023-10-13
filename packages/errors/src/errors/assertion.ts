export class AssertionFallbackError extends Error {
	constructor() {
		super('Assert failed - no custom error [E019]');
	}
}
