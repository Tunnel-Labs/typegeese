import { getModelForHyperschema, loadHyperschemas } from '~/index.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as CommentThreadHyperschema from './comment-thread/$schema.js';
import { getMongoose } from '~test/utils/mongoose.js';
import onetime from 'onetime';

export const getTunnelModels = onetime(async () => {
	const mongoose = await getMongoose();

	await loadHyperschemas(
		{
			Comment: CommentHyperschema,
			CommentThread: CommentThreadHyperschema
		},
		{ mongoose }
	);

	const CommentModel = getModelForHyperschema(CommentHyperschema, { mongoose });
	const CommentThreadModel = getModelForHyperschema(CommentThreadHyperschema, {
		mongoose
	});

	return {
		CommentModel,
		CommentThreadModel
	};
});
