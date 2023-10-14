import { toStringNoFail } from '../utils/to-string.js';

export class NoValidClassError extends TypeError {
	constructor(value: unknown) {
		super(
			'Value is not a function or does not have a constructor! [E028]\n' +
				`Value: "${toStringNoFail(value)}"`
		);
	}
}

export class SelfContainingClassError extends TypeError {
	constructor(name: string, key: string) {
		super(
			'It seems like the type used is the same as the target class, which is not supported ' +
				`("${name}.${key}") [E004]`
		);
	}
}
