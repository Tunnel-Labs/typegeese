import type { Schema } from 'mongoose';
import constants from '@typegoose/typegoose/lib/internal/constants.js';

export function versionStringToVersionNumber(versionString: string): number {
	const versionNumberString = versionString.split('-')[0]?.slice(1);

	if (versionNumberString === undefined) {
		throw new Error(
			`Failed to convert version string "${versionString}" to number`
		);
	}

	const versionNumber = Number(versionNumberString);

	if (Number.isNaN(versionNumber)) {
		throw new Error(`Invalid version number: ${versionNumberString}`);
	}

	return versionNumber;
}

export function getVersionFromSchema(schema: Schema): number {
	const version = Reflect.getOwnMetadata(
		constants.DecoratorKeys.PropCache,
		Object.getPrototypeOf((schema as any).prototype)
	)?.get('_v')?.options?.default;

	if (version === undefined) {
		throw new Error(`Could not determine version from schema: ${schema}`);
	}

	return version;
}
