import { toVersionNumber } from '../utils/version.js';
import { DecoratorKeys } from '../utils/decorator-keys.js';
import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass
} from '@typegeese/types';
import {
	getMigrationOptionsMap,
	getMigrationSchemasMap
} from './migration-schema.js';
import createClone from 'rfdc';

const clone = createClone();

export function getModelSchemaPropMapFromMigrationSchema({
	migrationSchema,
	updateTarget
}: {
	migrationSchema: AnyMigrationSchemaClass;
	updateTarget: false | { modelSchema: AnyModelSchemaClass };
}): Map<string, unknown> {
	const modelSchemaPropMap = new Map();

	const migrationSchemasMap = getMigrationSchemasMap();
	const migrationOptionsMap = getMigrationOptionsMap();

	const migrationSchemaMap = migrationSchemasMap.get(migrationSchema.name);
	if (migrationSchemaMap === undefined) {
		throw new Error(
			`Could not find migration schema map for "${migrationSchema.name}"`
		);
	}

	const migrationOptionMap = migrationOptionsMap.get(migrationSchema.name);
	if (migrationOptionMap === undefined) {
		throw new Error(
			`Could not find migration option map for "${migrationSchema.name}"`
		);
	}

	const migrationSchemaVersion = toVersionNumber(migrationSchema._v);

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
				updateTarget
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
				`Could not find migration schema "${migrationSchema.name}" for version "${currentMigrationSchemaVersion}"`
			);
		}

		const currentMigrationSchemaPropMap =
			Reflect.getMetadata(
				DecoratorKeys.PropCache,
				currentMigrationSchema.prototype
			) ?? new Map();

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
				updateTarget
			});

			for (const [propKey, propValue] of fromModelSchemaPropMap.entries()) {
				if (keysToOmit.has(propKey)) {
					continue;
				}

				modelSchemaPropMap.set(propKey, clone(propValue));
			}
		}
	}

	if (updateTarget) {
		for (const propValue of modelSchemaPropMap.values()) {
			(propValue as any).target = updateTarget.modelSchema.prototype;
		}
	}

	return modelSchemaPropMap;
}

export function getPropMapKeysForActiveSchema({
	schemaName
}: {
	schemaName: string;
}) {
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

	const propMap = getModelSchemaPropMapFromMigrationSchema({
		migrationSchema: latestMigrationSchema,
		updateTarget: false
	});

	return [...propMap.keys()];
}
