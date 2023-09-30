import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { IsEqual } from 'type-fest';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';
import type { RequiredKeysOf } from 'type-fest';

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

Schema('', '');

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

	class SubSchema extends (hyperschema.schema as any) {
		@prop({
			type: () => Number,
			default: version,
			required: true
		})
		public _v!: string;
	}

	return SubSchema as any;
}
