import { createHyperschemas } from '~/index.js';
import type { Mongoose } from 'mongoose';
import * as AccountHyperschema from './account/$schema.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as PostHyperschema from './post/$schema.js';
import * as _UserHyperschema from './_user/$schema.js';
import mem from 'mem';

export const getBlogModels = mem(
	async ({ mongoose }: { mongoose: Mongoose }) => {
		const { AccountModel, CommentModel, PostModel } =
			await createHyperschemas(
				{
					Account: AccountHyperschema,
					Comment: CommentHyperschema,
					Post: PostHyperschema,
					_User: _UserHyperschema
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
