import { getModelForClass } from '@typegoose/typegoose';
import type { Mongoose } from 'mongoose';
import { createHyperschema } from '~/utils/hyperschema.js';
import type {
	AnyUnnormalizedHyperschemaModule,
	NormalizeHyperschemaModule
} from '~/types/hyperschema-module.js';
import type { AnyHyperschema, Hyperschema } from '~/types/hyperschema.js';
import { normalizeHyperschemaModule } from '~/utils/hyperschema-module.js';
import { versionStringToVersionNumber } from '~/utils/version.js';

export function getModelForHyperschema<
	UnnormalizedHyperschemaModuleOrHyperschema extends
		| AnyUnnormalizedHyperschemaModule
		| AnyHyperschema
>(
	unnormalizedHyperschemaModuleOrHyperschema: UnnormalizedHyperschemaModuleOrHyperschema,
	{
		mongoose
	}: {
		mongoose: Mongoose;
	}
): ReturnType<
	typeof getModelForClass<{
		new (): Hyperschema<
			// @ts-expect-error: works
			NormalizeHyperschemaModule<UnnormalizedHyperschemaModuleOrHyperschema>
		>['schema'];
	}>
> {
	let hyperschema: AnyHyperschema;
	if ('schema' in (unnormalizedHyperschemaModuleOrHyperschema as any)) {
		hyperschema = unnormalizedHyperschemaModuleOrHyperschema as any;
	} else if (
		'migrationSchema' in (unnormalizedHyperschemaModuleOrHyperschema as any)
	) {
		hyperschema = createHyperschema(
			unnormalizedHyperschemaModuleOrHyperschema as any
		);
	} else {
		hyperschema = createHyperschema(
			normalizeHyperschemaModule(
				unnormalizedHyperschemaModuleOrHyperschema
			) as any
		);
	}

	const version = versionStringToVersionNumber(hyperschema.schema.prototype._v);

	const model = getModelForClass(hyperschema.schema, {
		existingMongoose: mongoose,
		schemaOptions: {
			collection: hyperschema.schemaName
		},
		options: {
			customName: hyperschema.schemaName + '-' + version
		}
	});

	return model as any;
}
