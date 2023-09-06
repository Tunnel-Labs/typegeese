import { getModelForHyperschema, loadHyperschemas } from '~/index.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as CommentThreadHyperschema from './comment-thread/$schema.js';
import mem from 'mem';
import { Mongoose } from 'mongoose';

export const getTunnelModels = mem(
	async ({ mongoose }: { mongoose: Mongoose }) => {
		await loadHyperschemas(
			{
				Comment: CommentHyperschema,
				CommentThread: CommentThreadHyperschema
			},
			{ mongoose }
		);

		const CommentModel = getModelForHyperschema(CommentHyperschema, {
			mongoose
		});
		const CommentThreadModel = getModelForHyperschema(
			CommentThreadHyperschema,
			{
				mongoose
			}
		);

		return {
			CommentModel,
			CommentThreadModel
		};
	},
	{ cacheKey: (args) => args[0].mongoose }
);
