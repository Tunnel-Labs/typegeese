import { getModelForClass, getModelWithString } from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';
import { createHyperschema } from '~/utils/hyperschema.js';
import type {
	AnyUnnormalizedHyperschemaModule,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';
import type { AnyHyperschema, Hyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import { getMigrationSchemasMap } from '~/utils/migration-schema.js';
import { createModelSchemaFromMigrationSchema } from '~/utils/schema.js';
import type { AnySchemaInstance } from '~/types/schema.js';

export function getModelForActiveHyperschema({
	schemaName
}: {
	schemaName: string;
}): ReturnType<
	typeof getModelForClass<{
		new (): AnySchemaInstance;
	}>
> {
	const schemas = getMigrationSchemasMap();
	const migrationSchemaMap = schemas.get(schemaName);

	if (migrationSchemaMap === undefined) {
		throw new Error(`Could not find migration schema map for "${schemaName}"`);
	}

	const latestMigrationSchema = migrationSchemaMap.get(
		migrationSchemaMap.size - 1
	);

	if (latestMigrationSchema === undefined) {
		throw new Error(
			`Could not find latest migration schema for "${schemaName}"`
		);
	}

	const modelSchema = createModelSchemaFromMigrationSchema({
		migrationSchema: latestMigrationSchema,
		schemaName
	});

	const version = versionStringToVersionNumber(modelSchema.prototype._v);

	const model = getModelWithString(schemaName + '-' + version);
	if (model === undefined) {
		throw new Error(
			`Could not find model for active hyperschema "${schemaName}" (version: ${version})`
		);
	}

	return model as any;
}

export function getModelForHyperschema<
	UnnormalizedHyperschemaModuleOrHyperschema extends
		| AnyUnnormalizedHyperschemaModule
		| AnyHyperschema
>(
	unnormalizedHyperschemaModuleOrHyperschema: UnnormalizedHyperschemaModuleOrHyperschema,
	{
		mongoose
	}: {
		mongoose: Mongoose;
	}
): ReturnType<
	typeof getModelForClass<{
		new (): Hyperschema<
			// @ts-expect-error: works
			NormalizeHyperschemaModule<UnnormalizedHyperschemaModuleOrHyperschema>
		>['schema'];
	}>
> {
	let hyperschema: AnyHyperschema;
	if ('schema' in (unnormalizedHyperschemaModuleOrHyperschema as any)) {
		hyperschema = unnormalizedHyperschemaModuleOrHyperschema as any;
	} else if (
		'migrationSchema' in (unnormalizedHyperschemaModuleOrHyperschema as any)
	) {
		hyperschema = createHyperschema(
			unnormalizedHyperschemaModuleOrHyperschema as any
		);
	} else {
		hyperschema = createHyperschema(
			normalizeHyperschemaModule(
				unnormalizedHyperschemaModuleOrHyperschema
			) as any
		);
	}

	const version = versionStringToVersionNumber(hyperschema.schema.prototype._v);

	const model = getModelForClass(hyperschema.schema, {
		existingMongoose: mongoose,
		schemaOptions: {
			collection: hyperschema.schemaName
		},
		options: {
			customName: hyperschema.schemaName + '-' + version
		}
	});

	return model as any;
}
