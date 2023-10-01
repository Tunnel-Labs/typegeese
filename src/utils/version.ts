import type { Schema } from 'mongoose';
import { DecoratorKeys } from '~/utils/decorator-keys.js';

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
	const version = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		(schema as any).prototype
	)?.get('_v')?.options?.default;

	if (version === undefined) {
		throw new Error(`Could not determine version from schema: ${schema}`);
	}

	return version;
}

export function isVersionedDocument(document: unknown) {
	return typeof document === 'object' && document !== null && '_v' in document;
}
