import { loadHyperschemas } from '~/index.js';
import * as AccountHyperschema from './account/$schema.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as PostHyperschema from './post/$schema.js';
import mem from 'mem';
import { Mongoose } from 'mongoose';

export const getBlogModels = mem(
	async ({ mongoose }: { mongoose: Mongoose }) => {
		const { AccountModel, CommentModel, PostModel } = await loadHyperschemas(
			{
				Account: AccountHyperschema,
				Comment: CommentHyperschema,
				Post: PostHyperschema
			},
			{ mongoose }
		);

		return {
			AccountModel,
			CommentModel,
			PostModel
		};
	},
	{ cacheKey: (args) => args[0].mongoose }
);
