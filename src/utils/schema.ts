import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import type { RequiredKeysOf } from 'type-fest';
import { DecoratorKeys } from '~/utils/decorator-keys.js';
import createClone from 'rfdc';

const clone = createClone();

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

/**
	Instead of inheriting from the previous schema migration, we instead create a copy of the class (this makes it easier to use discriminator types)
*/
export function Schema<SchemaName extends string>(
	name: SchemaName
): {
	new (): {
		__name__?: SchemaName;
		_id: string;
		_v: 0;
	};
};
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
): {
	new (): Omit<
		GetSchemaFromHyperschema<PreviousHyperschema>,
		| '_v'
		| '__type__'
		| (Options extends Record<string, unknown>
				? RequiredKeysOf<Options['omit']>
				: never)
	> & {
		_v: number;
	};
};
export function Schema(
	previousHyperschema?: any,
	versionString?: string,
	options?: {
		omit: Record<string, true>;
	}
): any {
	if (typeof previousHyperschema === 'string') {
		class SchemaClass {
			@prop({
				type: () => String,
				required: true
			})
			public _id!: string;

			@prop({
				type: () => Number,
				default: 0,
				required: true
			})
			public _v!: 0;
		}

		Object.defineProperty(SchemaClass, 'name', { value: previousHyperschema });

		return SchemaClass;
	}

	const hyperschema = normalizeHyperschema(previousHyperschema);
	const version = versionStringToVersionNumber(versionString!);

	class SchemaClass {}

	const propMap = Reflect.getMetadata(
		DecoratorKeys.PropCache,
		hyperschema.schema.prototype
	) as Map<string, { options?: { ref: string } }>;

	const newPropMap = clone(propMap);
	(newPropMap.get('_v') as any).options.default = version;

	Reflect.defineMetadata(
		DecoratorKeys.PropCache,
		newPropMap,
		SchemaClass.prototype
	);

	// If this schema has `disableLowerIndexes` set, we should the indexes of all the parent classes
	const leafSchemaModelOptions = Reflect.getOwnMetadata(
		DecoratorKeys.ModelOptions,
		hyperschema.schema as any
	);

	if (leafSchemaModelOptions?.options?.disableLowerIndexes) {
		Reflect.deleteMetadata(DecoratorKeys.Index, SchemaClass);
	}

	return SchemaClass;
}
