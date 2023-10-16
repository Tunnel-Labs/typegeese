import type {
	AnyMigrationSchemaClass,
	AnyModelSchemaClass
} from '@typegeese/types';

import { Schema } from './schema.js';
import { DecoratorKeys } from './decorator-keys.js';
import { toVersionNumber } from './version.js';

export function getMigrationSchemasMap(): Map<
	string,
	Map<number, AnyMigrationSchemaClass>
> {
	let migrationsSchemasMap =
		Reflect.getMetadata(DecoratorKeys.MigrationSchemas, Schema) ??
		(globalThis as any)[DecoratorKeys.MigrationSchemas];

	if (migrationsSchemasMap === undefined) {
		migrationsSchemasMap = new Map();
		Reflect.defineMetadata(
			DecoratorKeys.MigrationSchemas,
			migrationsSchemasMap,
			Schema
		);
		(globalThis as any)[DecoratorKeys.MigrationOptions] = migrationsSchemasMap;
	}

	return migrationsSchemasMap;
}

export function getMigrationOptionsMap(): Map<
	string,
	Map<
		number,
		{ omit?: Record<string, true>; from?: AnyMigrationSchemaClass } | undefined
	>
> {
	let migrationsOptionsMap =
		Reflect.getMetadata(DecoratorKeys.MigrationOptions, Schema) ??
		(globalThis as any)[DecoratorKeys.MigrationOptions];

	if (migrationsOptionsMap === undefined) {
		migrationsOptionsMap = new Map();
		Reflect.defineMetadata(
			DecoratorKeys.MigrationOptions,
			migrationsOptionsMap,
			Schema
		);
		(globalThis as any)[DecoratorKeys.MigrationOptions] = migrationsOptionsMap;
	}

	return migrationsOptionsMap;
}

export function getLatestMigrationSchemaOfModelSchema(
	modelSchema: AnyModelSchemaClass
): AnyMigrationSchemaClass {
	const migrationSchemasMap = getMigrationSchemasMap();

	const migrationSchemaMap = migrationSchemasMap.get(modelSchema.name);

	if (migrationSchemaMap === undefined) {
		throw new Error(
			`Could not find migration schema map for "${modelSchema.name}"`
		);
	}

	const version = toVersionNumber(modelSchema._v);
	const latestMigrationSchema = migrationSchemaMap.get(version);

	if (latestMigrationSchema === undefined) {
		throw new Error(
			`Could not find migration schema for "${modelSchema.name}" with version "${version}"`
		);
	}

	return latestMigrationSchema;
}
