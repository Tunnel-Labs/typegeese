import { prop } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { GetSchemaFromHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { versionStringToVersionNumber } from '~/utils/version.js';

export function defineSchemaOptions(schemaOptions: SchemaOptions) {
	return schemaOptions;
}

export function Schema<PreviousHyperschema, V extends string>(
	previousHyperschema: PreviousHyperschema,
	versionString: V
): {
	new (): Omit<
		GetSchemaFromHyperschema<PreviousHyperschema>,
		'_v' | '__type'
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
