import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import type { RequiredKeysOf } from 'type-fest';
import { DecoratorKeys } from '~/utils/decorator-keys.js';

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

/**
	Instead of inheriting from the previous schema migration, we instead create a copy of the class (this makes it easier to use discriminator types)
*/
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
		| '__type'
		| (Options extends Record<string, unknown>
				? RequiredKeysOf<Options['omit']>
				: never)
	> & {
		_v: number;
	};
} {
	const hyperschema = normalizeHyperschema(previousHyperschema);
	const version = versionStringToVersionNumber(versionString);

	class SchemaClass {
		@prop({
			type: () => Number,
			default: version,
			required: true
		})
		public _v!: string;
	}

	// Copy over all the metadata properties
	for (const decoratorKey of Object.keys(DecoratorKeys)) {
		const decoratorValue = Reflect.getOwnMetadata(
			decoratorKey,
			(hyperschema.schema as any).prototype
		);

		Reflect.defineMetadata(decoratorKey, decoratorValue, SchemaClass.prototype);
	}

	// If this schema has `disableLowerIndexes` set, we should the indexes of all the parent classes
	const leafSchemaModelOptions = Reflect.getOwnMetadata(
		DecoratorKeys.ModelOptions,
		hyperschema.schema as any
	);

	if (leafSchemaModelOptions?.options?.disableLowerIndexes) {
		Reflect.deleteMetadata(DecoratorKeys.Index, SchemaClass.prototype);
	}

	return SchemaClass as any;
}
