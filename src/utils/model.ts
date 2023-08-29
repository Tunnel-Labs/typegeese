import { getModelForClass } from '@typegoose/typegoose';
import { Mongoose } from 'mongoose';
import { NormalizedHyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschema } from '~/utils/hyperschema.js';
import { getVersionFromSchema } from '~/utils/version.js';

export function getModelForHyperschema<Hyperschema>(
	unnormalizedHyperschema: Hyperschema,
	{
		mongoose
	}: {
		mongoose: Mongoose;
	}
): ReturnType<
	typeof getModelForClass<{
		new (): NormalizedHyperschema<Hyperschema>['schema'];
	}>
> {
	const hyperschema = normalizeHyperschema(unnormalizedHyperschema);
	const version = getVersionFromSchema(hyperschema.schema as any);

	const model = getModelForClass(hyperschema.schema as any, {
		existingMongoose: mongoose,
		schemaOptions: {
			collection: hyperschema.schemaName
		},
		options: {
			customName: hyperschema.schemaName + '-' + version
		}
	});

	return model;
}
