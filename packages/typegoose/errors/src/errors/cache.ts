export class CacheDisabledError extends TypeError {
	constructor(where: string) {
		super(`Tried using cache, but was disabled at "${where}" [E033]`);
	}
}
