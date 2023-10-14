import type { Mongoose } from 'mongoose';

import { loadModelSchemas } from 'typegeese';
import { Account } from './account/$schema.js';
import { Comment } from './comment/$schema.js';
import { Post } from './post/$schema.js';
import { User } from './_user/$schema.js';
import mem from 'mem';

export const getBlogModels = mem(
	async ({ mongoose }: { mongoose: Mongoose }) => {
		const { AccountModel, CommentModel, PostModel } = await loadModelSchemas(
			{
				Account,
				Comment,
				Post,
				_User: User
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
