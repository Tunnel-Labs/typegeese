import type { AnySchemaClass } from '~/types/schema.js';
import { Schema } from '~/utils/schema.js';
import { DecoratorKeys } from '~/utils/decorator-keys.js';

export function getMigrationSchemasMap(): Map<
	string,
	Map<number, AnySchemaClass>
> {
	let migrationsSchemasMap = Reflect.getMetadata(
		DecoratorKeys.MigrationSchemas,
		Schema
	);

	if (migrationsSchemasMap === undefined) {
		migrationsSchemasMap = new Map();
		Reflect.defineMetadata(
			DecoratorKeys.MigrationSchemas,
			migrationsSchemasMap,
			Schema
		);
	}

	return migrationsSchemasMap;
}

export function getMigrationOptionsMap(): Map<
	string,
	Map<number, { omit?: Record<string, true> } | undefined>
> {
	let migrationsOptionsMap = Reflect.getMetadata(
		DecoratorKeys.MigrationOptions,
		Schema
	);

	if (migrationsOptionsMap === undefined) {
		migrationsOptionsMap = new Map();
		Reflect.defineMetadata(
			DecoratorKeys.MigrationOptions,
			migrationsOptionsMap,
			Schema
		);
	}

	return migrationsOptionsMap;
}
