import {
	AnyUnnormalizedHyperschemaModule,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';

export function normalizeHyperschemaModule<
	H extends AnyUnnormalizedHyperschemaModule
>(unnormalizedHyperschemaModule: H): NormalizeHyperschemaModule<H> {
	if (
		unnormalizedHyperschemaModule === null ||
		unnormalizedHyperschemaModule === undefined ||
		(typeof unnormalizedHyperschemaModule !== 'object' &&
			typeof unnormalizedHyperschemaModule !== 'function')
	) {
		throw new Error(
			`Invalid hyperschema module: ${JSON.stringify(
				unnormalizedHyperschemaModule
			)}`
		);
	}

	// If the `schemaName` property is present, the hyperschema is already normalized
	if ('schemaName' in unnormalizedHyperschemaModule) {
		return unnormalizedHyperschemaModule as any;
	}

	const migrationKey = Object.keys(unnormalizedHyperschemaModule).find(
		(key) => key === 'migration' || key.endsWith('_migration')
	);

	let isMissingMigrationKey = false;
	if (migrationKey === undefined) {
		isMissingMigrationKey = true;
	}

	const migration =
		unnormalizedHyperschemaModule[
			migrationKey as keyof typeof unnormalizedHyperschemaModule
		];

	const relationsKey = Object.keys(unnormalizedHyperschemaModule).find(
		(key) => key === 'relations' || key.endsWith('_relations')
	);

	const relations =
		relationsKey === undefined
			? {}
			: unnormalizedHyperschemaModule[
					relationsKey as keyof typeof unnormalizedHyperschemaModule
			  ];

	const schemaOptionsKey =
		Object.keys(unnormalizedHyperschemaModule).find(
			(key) => key === 'schemaOptions' || key.endsWith('_schemaOptions')
		) ?? 'schemaOptions';

	const schemaOptions =
		unnormalizedHyperschemaModule[
			schemaOptionsKey as keyof typeof unnormalizedHyperschemaModule
		] ?? {};

	const schemaKey = Object.keys(unnormalizedHyperschemaModule).find(
		(key) =>
			key !== migrationKey && key !== relationsKey && key !== schemaOptionsKey
	);
	if (schemaKey === undefined) {
		throw new Error(
			`Missing schema key in hyperschema module: "${JSON.stringify(
				unnormalizedHyperschemaModule
			)}}"`
		);
	}

	const migrationSchema = unnormalizedHyperschemaModule[
		schemaKey as keyof typeof unnormalizedHyperschemaModule
	] as any;

	if (isMissingMigrationKey && migrationSchema._v !== 0) {
		throw new Error(
			`Missing migration key in hyperschema module: ${JSON.stringify(
				unnormalizedHyperschemaModule
			)}`
		);
	}

	return {
		schemaName: schemaKey,
		migrationSchema,
		migration,
		relations,
		schemaOptions
	} as any;
}
