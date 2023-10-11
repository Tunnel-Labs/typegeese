import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import type { Class, RequiredKeysOf } from 'type-fest';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import createClone from 'rfdc';
import { BaseSchemaClass, NewSchemaOptions } from '~/types/schema.js';
import { MigrationData } from '~/index.js';

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

export interface BaseSchemaExtends<
	SchemaName extends string,
	Options extends NewSchemaOptions
> {
	new <T>(): (Options['from'] extends new () => infer Schema
		? Omit<Schema, '_v' | '__type__' | '__name__'>
		: {}) & {
		__type__?: T;
		__name__?: SchemaName;
		_id: string;
		_v: 'v0';
	};
}

export interface MigrationSchemaExtends<
	PreviousHyperschema,
	Options extends {
		omit: {
			[K in keyof GetSchemaFromHyperschema<PreviousHyperschema>]?: true;
		};
	}
> {
	new <T extends { _v: string; __migration__: MigrationData }>(): Omit<
		GetSchemaFromHyperschema<PreviousHyperschema>,
		| '_v'
		| '__type__'
		| '__migration__'
		| (Options extends Record<string, unknown>
				? RequiredKeysOf<Options['omit']>
				: never)
	> & {
		__type__?: T;
		_id: string;
	};
}

/**
	Instead of inheriting from the previous schema migration, we instead create a copy of the class (this makes it easier to use discriminator types)
*/
export function Schema<
	SchemaName extends string,
	Options extends NewSchemaOptions
>(name: SchemaName, options?: Options): BaseSchemaExtends<SchemaName, Options>;
export function Schema<
	PreviousHyperschema,
	Options extends {
		omit: {
			[K in keyof GetSchemaFromHyperschema<PreviousHyperschema>]?: true;
		};
	}
>(
	previousHyperschema: PreviousHyperschema,
	options?: Options
): MigrationSchemaExtends<PreviousHyperschema, Options>;
export function Schema(
	previousHyperschemaOrNewSchemaName?: any,
	versionStringOrNewSchemaOptions?: string | NewSchemaOptions,
	options?: {
		omit: Record<string, true>;
	}
): any {
	let typegeeseSchemas = Reflect.getMetadata(
		'typegeese:schemaParent',
		Schema
	) as Map<
		string, // schema name
		Map<string, BaseSchemaClass | null> // map from version to parent schema (previous version)
	>;

	if (typegeeseSchemas === undefined) {
		typegeeseSchemas = new Map();
		Reflect.defineMetadata('typegeese:schemas', Schema, typegeeseSchemas);
	}

	if (typeof previousHyperschemaOrNewSchemaName === 'string') {
		const schemaName = previousHyperschemaOrNewSchemaName;
		let schemaMap = typegeeseSchemas.get(schemaName);
		if (schemaMap === undefined) {
			schemaMap = new Map();
			typegeeseSchemas.set(schemaName, schemaMap);
		}

		schemaMap.set('v0', null);
	} else {
		const previousHyperschema = normalizeHyperschema(
			previousHyperschemaOrNewSchemaName
		);
		const { schemaName } = previousHyperschema;
		let schemaMap = typegeeseSchemas.get(schemaName);
		if (schemaMap === undefined) {
			schemaMap = new Map();
			typegeeseSchemas.set(schemaName, schemaMap);
		}

		const versionString = versionStringOrNewSchemaOptions as string;
		schemaMap.set(versionString, previousHyperschema.schema);
	}

	// We return the `Object` constructor (which is basically equivalent to a no-op `extends` clause)
	// to avoid schema inheritance that might conflict with typegoose
	return Object;
}
