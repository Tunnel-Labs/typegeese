import type { AnyModelSchemaClass } from '@typegeese/types';

import { getLatestMigrationSchemaOfModelSchema } from './migration-schema.js';
import { getModelSchemaPropMapFromMigrationSchema } from './prop-map.js';

export function getRelationsFromModelSchema(modelSchema: AnyModelSchemaClass) {
	const propMap = getModelSchemaPropMapFromMigrationSchema({
		migrationSchema: getLatestMigrationSchemaOfModelSchema(modelSchema),
		updateTarget: {
			modelSchema
		}
	});

	const relations: Array<{
		hostField: string;
		foreignField: string;
		foreignModelName: string;
		onDelete: 'Cascade' | 'SetNull' | 'Restrict';
	}> = [];

	for (const [propKey, propValue] of propMap.entries()) {
		if ((propValue as any)?.options?.__relations?.onDelete !== undefined) {
			relations.push({
				foreignField: (propValue as any).options.__foreignField,
				foreignModelName: (propValue as any).options.ref,
				hostField: propKey,
				onDelete: (propValue as any).options.__relations.onDelete
			});
		}
	}

	return relations;
}
