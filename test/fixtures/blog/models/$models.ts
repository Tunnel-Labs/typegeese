import { loadHyperschemas } from '~/index.js';
import * as UserHyperschema from './user/$schema.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as PostHyperschema from './post/$schema.js';
import mem from 'mem';
import { Mongoose } from 'mongoose';

export const getBlogModels = mem(
	async ({ mongoose }: { mongoose: Mongoose }) => {
		const { CommentModel, UserModel, PostModel } = await loadHyperschemas(
			{
				User: UserHyperschema,
				Comment: CommentHyperschema,
				Post: PostHyperschema
			},
			{ mongoose }
		);

		return {
			UserModel,
			CommentModel,
			PostModel
		};
	},
	{ cacheKey: (args) => args[0].mongoose }
);
