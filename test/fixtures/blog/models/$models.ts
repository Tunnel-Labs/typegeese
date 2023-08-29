import { getModelForHyperschema, loadHyperschemas } from '~/index.js';
import * as UserHyperschema from './user/$schema.js';
import * as CommentHyperschema from './comment/$schema.js';
import * as PostHyperschema from './post/$schema.js';
import { getMongoose } from '~test/utils/mongoose.js';
import onetime from 'onetime';

export const getModels = onetime(async () => {
	const mongoose = await getMongoose();

	await loadHyperschemas(
		{
			User: UserHyperschema,
			Comment: CommentHyperschema,
			Post: PostHyperschema
		},
		{ mongoose }
	);

	const UserModel = getModelForHyperschema(UserHyperschema, { mongoose });
	const CommentModel = getModelForHyperschema(CommentHyperschema, { mongoose });
	const PostModel = getModelForHyperschema(PostHyperschema, { mongoose });

	return {
		UserModel,
		CommentModel,
		PostModel
	};
});
