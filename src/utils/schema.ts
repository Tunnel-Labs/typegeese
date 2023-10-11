import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import type { RequiredKeysOf } from 'type-fest';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import createClone from 'rfdc';
import {
	NewSchemaOptions,
	BaseSchema,
	AbstractBaseSchema,
	AbstractMigrationSchema
} from '~/types/schema.js';

const clone = createClone();

export function getFlattenedSchema(schema: BaseSchema) {
	const schemaVersion = schema._v;
	const flattenedSchema = createBaseSchema({
		version: schemaVersion,
		schemaName: schema.name
	});

	copySchemaMetadata({
		from: schema,
		to: flattenedSchema
	});

	return flattenedSchema;
}

export function createBaseSchema<Version extends number>({
	version,
	schemaName
}: {
	version: Version;
	schemaName: string;
}): BaseSchema {
	const baseSchema = class {} as BaseSchema;

	prop({ type: () => String, required: true })(baseSchema, '_id');
	prop({ type: () => Number, default: version, required: true })(
		baseSchema,
		'_v'
	);

	Object.defineProperty(baseSchema, 'name', { value: schemaName });
	Object.defineProperty(baseSchema, '_v', { value: version });

	return baseSchema;
}

export function copySchemaMetadata({
	from: fromSchema,
	to: toSchema
}: {
	from: BaseSchema;
	to: BaseSchema;
}) {
	const fromSchemaBasePropMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		fromSchema.prototype
	) as Map<string, { options?: { ref: string } }>;

	const fromSchemaPrototypePropMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		Object.getPrototypeOf(fromSchema).prototype
	) as Map<string, { options?: { ref: string } }>;

	const toSchemaPropMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		toSchema.prototype
	) as Map<string, { options?: { ref: string } }>;

	const newPropMap = clone(
		new Map([
			...fromSchemaBasePropMap.entries(),
			...fromSchemaPrototypePropMap.entries(),
			// This needs to be last in order to make sure the "_v" prop always reflects the latest schema version
			...toSchemaPropMap.entries()
		])
	);

	Reflect.defineMetadata(
		DecoratorKeys.PropCache,
		newPropMap,
		toSchema.prototype
	);

	return toSchema;
}

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

/**
	Instead of inheriting from the previous schema migration, we instead create a copy of the class (this makes it easier to use discriminator types)
*/
export function Schema<
	SchemaName extends string,
	Options extends NewSchemaOptions
>(
	name: SchemaName,
	options?: Options
): typeof AbstractBaseSchema<
	(Options['from'] extends new () => infer Schema
		? Omit<Schema, '_v' | '__type__' | '__name__'>
		: {}) & {
		__name__?: SchemaName;
		_id: string;
		_v: 0;
	}
>;
export function Schema<
	PreviousHyperschema,
	V extends string,
	Options extends {
		omit: {
			[K in keyof GetSchemaFromHyperschema<PreviousHyperschema>]?: true;
		};
	}
>(
	previousHyperschema: PreviousHyperschema,
	versionString: V,
	options?: Options
): typeof AbstractMigrationSchema<
	Omit<
		GetSchemaFromHyperschema<PreviousHyperschema>,
		| '_v'
		| '__type__'
		| (Options extends Record<string, unknown>
				? RequiredKeysOf<Options['omit']>
				: never)
	> & {
		_v: number;
		_id: string;
	}
>;
export function Schema(
	previousHyperschemaOrNewSchemaName?: any,
	versionStringOrNewSchemaOptions?: string | NewSchemaOptions,
	options?: {
		omit: Record<string, true>;
	}
): any {
	if (typeof previousHyperschemaOrNewSchemaName === 'string') {
		const newSchemaName = previousHyperschemaOrNewSchemaName;
		return createBaseSchema({
			schemaName: newSchemaName,
			version: 0
		});
	}

	const previousHyperschema = previousHyperschemaOrNewSchemaName;
	const versionString = versionStringOrNewSchemaOptions as string;

	const hyperschema = normalizeHyperschema(previousHyperschema);
	const version = versionStringToVersionNumber(versionString);

	const prototypeSchema = createBaseSchema({
		schemaName: hyperschema.schemaName,
		version
	});

	// If this schema has `disableLowerIndexes` set, we should the indexes of all the parent classes
	const leafSchemaModelOptions = Reflect.getOwnMetadata(
		DecoratorKeys.ModelOptions,
		hyperschema.schema as any
	);

	if (leafSchemaModelOptions?.options?.disableLowerIndexes) {
		Reflect.deleteMetadata(DecoratorKeys.Index, newSchema);
	}

	return newSchema;
}
