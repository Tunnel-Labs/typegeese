import { isNullOrUndefined } from '@-/shared';
import mongoose from 'mongoose';
import semver from 'semver';

// using "typeof process", because somehow js gives a ReferenceError when using "process === undefined" in browser
/* istanbul ignore next */
if (
	typeof process !== 'undefined' &&
	!isNullOrUndefined(process?.version) &&
	!isNullOrUndefined(mongoose?.version)
) {
	// for usage on client side
	/* istanbul ignore next */
	if (semver.lt(mongoose?.version, '7.6.1')) {
		throw new Error(
			`Please use mongoose 7.6.1 or higher (Current mongoose: ${mongoose.version}) [E001]`
		);
	}

	/* istanbul ignore next */
	if (semver.lt(process.version.slice(1), '14.17.0')) {
		throw new Error(
			'You are using a NodeJS Version below 14.17.0, Please Upgrade! [E002]'
		);
	}
}
