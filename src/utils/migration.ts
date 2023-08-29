import { MigrationData, MigrationFunctions } from '~/types/migration.js';
import { NormalizedHyperschema } from '~/types/hyperschema.js';
import { getVersionFromSchema } from '~/utils/version.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { IsEqual, Promisable } from 'type-fest';
import { ModelSchema } from '~/classes/index.js';

/**
	Applies the migrations of hyperschemas in order

	@param args
	@param args.result - The result returned from mongoose (the raw object; only updated if the projections include those results)
*/
export async function applyHyperschemaMigrationsToDocument({
	meta,
	documentMetadata,
	hyperschema,
	updatedProperties
}: {
	meta: any;
	documentMetadata: {
		_id: string;
		_v: number;
	};
	hyperschema: NormalizedHyperschema<any>;
	updatedProperties: Record<string, unknown>;
}): Promise<{ updatedProperties: Record<string, unknown> }> {
	const hyperschemaVersion = getVersionFromSchema(hyperschema.schema);

	// If the hyperschema version is greater than the document version, then we should apply the previous hyperschema migration before the current one
	if (hyperschemaVersion > documentMetadata._v) {
		applyHyperschemaMigrationsToDocument({
			meta,
			updatedProperties,
			hyperschema: hyperschema.migration.previousHyperschema,
			documentMetadata
		});
	}

	const document = await hyperschema.migration.getData.call(
		{ meta },
		{ _id: documentMetadata._id }
	);

	// Applying the hyperschema's migrations
	for (const [property, getProperty] of Object.entries(
		hyperschema.migration.migrationFunctions
	)) {
		const value = await (getProperty as any).call(document);
		updatedProperties[property] = value;
	}

	return { updatedProperties };
}

export function createMigration<CurrentSchema extends ModelSchema>(
	...args: IsEqual<CurrentSchema['_v'], 0> extends true ? [null] : []
): {
	from: <PreviousHyperschema>(previousHyperschema: PreviousHyperschema) => {
		with: <DataType>(
			getData: (
				this: { meta: any },
				args: { _id: string }
			) => Promisable<DataType>
		) => {
			migrate(
				migrationFunctions: MigrationFunctions<
					NormalizedHyperschema<PreviousHyperschema>['schema'],
					CurrentSchema,
					DataType
				>
			): MigrationData;
		};
	};
} {
	if (args[0] === null) {
		return {
			from: () => ({
				with: () => ({
					migrate: () => ({
						getData() {},
						migrationFunctions: {},
						previousHyperschema: null!
					})
				})
			})
		};
	}

	return {
		from: (previousHyperschema) => ({
			with: (getData) => ({
				migrate: (migrationFunctions) =>
					({
						getData,
						migrationFunctions,
						previousHyperschema: normalizeHyperschema(previousHyperschema)
					}) as any
			})
		})
	};
}
