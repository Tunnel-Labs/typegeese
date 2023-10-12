import { versionStringToVersionNumber } from '~/utils/version.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import type { AnySchemaClass } from '~/types/schema.js';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from '~/utils/migration-schema.js';
import createClone from 'rfdc';

const clone = createClone();

export function getModelSchemaPropMapFromMigrationSchema({
	migrationSchema,
	schemaName,
	modelSchema
}: {
	migrationSchema: AnySchemaClass;
	schemaName: string;
	modelSchema: AnySchemaClass;
}): Map<string, unknown> {
	const modelSchemaPropMap = new Map();

	const migrationSchemasMap = getMigrationSchemasMap();
	const migrationOptionsMap = getMigrationOptionsMap();

	const migrationSchemaMap = migrationSchemasMap.get(schemaName);
	if (migrationSchemaMap === undefined) {
		throw new Error(`Could not find migration schema map for "${schemaName}"`);
	}

	const migrationOptionMap = migrationOptionsMap.get(schemaName);
	if (migrationOptionMap === undefined) {
		throw new Error(`Could not find migration option map for "${schemaName}"`);
	}

	const migrationSchemaVersion = versionStringToVersionNumber(
		migrationSchema.prototype._v
	);

	const currentMigrationSchemaPropMap =
		Reflect.getMetadata(DecoratorKeys.PropCache, migrationSchema.prototype) ??
		new Map();

	for (const [propKey, propValue] of currentMigrationSchemaPropMap.entries()) {
		modelSchemaPropMap.set(propKey, clone(propValue));
	}

	const currentMigrationSchemaOptions = migrationOptionMap.get(
		migrationSchemaVersion
	);

	if (migrationSchemaVersion === 0) {
		if (currentMigrationSchemaOptions?.from !== undefined) {
			const fromModelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
				migrationSchema: currentMigrationSchemaOptions.from,
				schemaName: currentMigrationSchemaOptions.from.name,
				modelSchema
			});

			for (const [propKey, propValue] of fromModelSchemaPropMap.entries()) {
				modelSchemaPropMap.set(propKey, clone(propValue));
			}
		}
	}

	const keysToOmit = new Set();

	for (const key of Object.keys(currentMigrationSchemaOptions?.omit ?? {})) {
		keysToOmit.add(key);
	}

	// Loop through the migration chain
	for (
		let currentMigrationSchemaVersion = migrationSchemaVersion - 1;
		currentMigrationSchemaVersion >= 0;
		currentMigrationSchemaVersion -= 1
	) {
		const currentMigrationSchema = migrationSchemaMap.get(
			currentMigrationSchemaVersion
		);
		if (currentMigrationSchema === undefined) {
			throw new Error(
				`Could not find migration schema "${schemaName}" for version "${currentMigrationSchemaVersion}"`
			);
		}

		const currentMigrationSchemaPropMap = Reflect.getMetadata(
			DecoratorKeys.PropCache,
			currentMigrationSchema.prototype
		) as Map<string, { options?: { ref: string } }>;

		const currentMigrationSchemaOptions = migrationOptionMap.get(
			currentMigrationSchemaVersion
		);

		for (const [
			propKey,
			propValue
		] of currentMigrationSchemaPropMap.entries()) {
			if (keysToOmit.has(propKey)) {
				continue;
			}

			modelSchemaPropMap.set(propKey, clone(propValue));
		}

		for (const key of Object.keys(currentMigrationSchemaOptions?.omit ?? {})) {
			keysToOmit.add(key);
		}

		if (
			currentMigrationSchemaVersion === 0 &&
			currentMigrationSchemaOptions?.from !== undefined
		) {
			const fromModelSchemaPropMap = getModelSchemaPropMapFromMigrationSchema({
				migrationSchema: currentMigrationSchemaOptions.from,
				schemaName,
				modelSchema
			});

			for (const [propKey, propValue] of fromModelSchemaPropMap.entries()) {
				if (keysToOmit.has(propKey)) {
					continue;
				}

				modelSchemaPropMap.set(propKey, clone(propValue));
			}
		}
	}

	for (const propValue of modelSchemaPropMap.values()) {
		(propValue as any).target = modelSchema.prototype;
	}

	return modelSchemaPropMap;
}
