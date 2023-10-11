import { getModelForClass } from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';
import { createHyperschema } from '~/utils/hyperschema.js';
import type {
	AnyUnnormalizedHyperschemaModule,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';
import type { Hyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import { versionStringToVersionNumber } from '~/utils/version.js';

export function getModelForHyperschema<
	UnnormalizedHyperschemaModule extends AnyUnnormalizedHyperschemaModule
>(
	unnormalizedHyperschemaModule: UnnormalizedHyperschemaModule,
	{
		mongoose
	}: {
		mongoose: Mongoose;
	}
): ReturnType<
	typeof getModelForClass<{
		new (): Hyperschema<
			// @ts-expect-error: works
			NormalizeHyperschemaModule<UnnormalizedHyperschemaModule>
		>['schema'];
	}>
> {
	const normalizedHyperschemaModule = normalizeHyperschemaModule(
		unnormalizedHyperschemaModule
	);
	const version = versionStringToVersionNumber(
		normalizedHyperschemaModule.migrationSchema.prototype._v
	);

	const hyperschema = createHyperschema(normalizedHyperschemaModule as any);

	const model = getModelForClass(hyperschema.schema, {
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
