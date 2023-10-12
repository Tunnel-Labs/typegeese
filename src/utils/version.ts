import type { AnySchemaClass } from '~/index.js';

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

export function getVersionFromSchema(schema: AnySchemaClass): number {
	const version = schema.prototype._v;

	if (version === undefined) {
		throw new Error(`Could not determine version from schema: ${schema}`);
	}

	return versionStringToVersionNumber(version);
}

export function isVersionedDocument(document: unknown) {
	return typeof document === 'object' && document !== null && '_v' in document;
}
