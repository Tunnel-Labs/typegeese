import {
	AnyUnnormalizedHyperschemaModule,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';

export function normalizeHyperschemaModule<
	H extends AnyUnnormalizedHyperschemaModule
>(hyperschemaModule: H): NormalizeHyperschemaModule<H> {
	if (
		hyperschemaModule === null ||
		hyperschemaModule === undefined ||
		(typeof hyperschemaModule !== 'object' &&
			typeof hyperschemaModule !== 'function')
	) {
		throw new Error(
			`Invalid hyperschema module: ${JSON.stringify(hyperschemaModule)}`
		);
	}

	// If the `schemaName` property is present, the hyperschema is already normalized
	if ('schemaName' in hyperschemaModule) {
		return hyperschemaModule as any;
	}

	const migrationKey = Object.keys(hyperschemaModule).find(
		(key) => key === 'migration' || key.endsWith('_migration')
	);

	if (migrationKey === undefined) {
		throw new Error(
			`Missing migration key in hyperschema module: ${JSON.stringify(
				hyperschemaModule
			)}`
		);
	}

	const migration =
		hyperschemaModule[migrationKey as keyof typeof hyperschemaModule];

	const relationsKey = Object.keys(hyperschemaModule).find(
		(key) => key === 'relations' || key.endsWith('_relations')
	);

	const relations =
		relationsKey === undefined
			? {}
			: hyperschemaModule[relationsKey as keyof typeof hyperschemaModule];

	const schemaOptionsKey =
		Object.keys(hyperschemaModule).find(
			(key) => key === 'schemaOptions' || key.endsWith('_schemaOptions')
		) ?? 'schemaOptions';

	const schemaOptions =
		hyperschemaModule[schemaOptionsKey as keyof typeof hyperschemaModule] ?? {};

	const schemaKey = Object.keys(hyperschemaModule).find(
		(key) =>
			key !== migrationKey && key !== relationsKey && key !== schemaOptionsKey
	);
	if (schemaKey === undefined) {
		throw new Error(
			`Missing schema key in hyperschema module: "${JSON.stringify(
				hyperschemaModule
			)}}"`
		);
	}

	const migrationSchema = hyperschemaModule[
		schemaKey as keyof typeof hyperschemaModule
	] as any;

	return {
		schemaName: schemaKey,
		migrationSchema,
		migration,
		relations,
		schemaOptions
	} as any;
}
