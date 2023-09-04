import { beforeAll, expect, test } from 'vitest';
import { CreateInput, getModelForHyperschema, select } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import * as UserV0 from '~test/fixtures/blog/models/user/v0.js';
import * as PostV0 from '~test/fixtures/blog/models/post/v0.js';

beforeAll(async () => {
	const mongoose = await getMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports nested self-referential select', async () => {
	const mongoose = await getMongoose();
	const UserV0Model = getModelForHyperschema(UserV0, {
		mongoose
	});
	const PostV0Model = getModelForHyperschema(PostV0, {
		mongoose
	});

	const userId = createId();
	UserV0Model.create({
		_id: userId,
		name: 'John Doe',
		email: 'johndoe@example.com'
	} satisfies CreateInput<UserV0.User>);

	const postId = createId();
	await PostV0Model.create({
		_id: postId,
		title: 'Post 1',
		author: userId,
		content: 'This is the first post.'
	} satisfies CreateInput<PostV0.Post>);

	const { PostModel } = await getModels();
	const post = (await select(PostModel.findById(postId), {
		title: true,
		author: {
			select: {
				posts: {
					select: {
						title: true
					}
				}
			}
		}
	}))!;

	console.log(post)

	expect(post).not.toBeNull();
	expect(post.title).toBe(post.author.posts[0]?.title);
});
