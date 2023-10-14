import type { SchemaOptions } from 'mongoose';
import type { AnyNormalizedHyperschemaModule } from './hyperschema-module.js';
import type { MigrationData } from './migration.js';
import type { AnyRelations } from './relations.js';
import type { AnySchemaClass } from './schema.js';

export type Hyperschema<H extends AnyNormalizedHyperschemaModule> = {
	schemaName: H['schemaName'];
	schema: H['migrationSchema'];
	migration: H['migration'];
	relations: H['relations'];
	schemaOptions?: H['schemaOptions'];
};

export interface AnyHyperschema {
	schemaName: string;
	schema: AnySchemaClass;
	migration: MigrationData;
	relations: AnyRelations;
	schemaOptions?: SchemaOptions;
}
