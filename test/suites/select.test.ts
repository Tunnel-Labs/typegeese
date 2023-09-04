import { beforeAll, expect, test } from 'vitest';
import { CreateInput, getModelForHyperschema, select } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import { User, Post } from '~test/fixtures/blog/models/$schemas.js';

beforeAll(async () => {
	const mongoose = await getMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports nested self-referential select', async () => {
	const mongoose = await getMongoose();
	const { PostModel, UserModel } = await getModels();

	const userId = createId();
	UserModel.create({
		_id: userId,
		name: 'John Doe',
		email: 'johndoe@example.com',
		avatarUrl: 'https://example.com/avatar.png',
		bio: null,
		username: 'johndoe'
	} satisfies CreateInput<User>);

	const postId = createId();
	await PostModel.create({
		_id: postId,
		title: 'Post 1',
		author: userId,
		content: 'This is the first post.',
		description: 'This is the first post.'
	} satisfies CreateInput<Post>);

	const post = (await select(PostModel.findById(postId), {
		title: true,
		author: {
			select: {
				posts: {
					select: {
						_id: true,
						title: true,
						author: {
							select: {
								_id: true
							}
						}
					}
				}
			}
		}
	}))!;

	expect(post).not.toBeNull();
	expect(post.title).toBe(post.author.posts[0]?.title);
});
