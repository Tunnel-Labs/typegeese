import { beforeAll, expect, test } from 'vitest';
import { CreateInput, select } from 'typegeese';
import { createId } from '@paralleldrive/cuid2';
import { getBlogModels } from '../fixtures/blog/models/$models.js';
import { createMongoose } from '../utils/mongoose.js';
import * as Blog from '../fixtures/blog/models/$schemas.js';

beforeAll(async () => {
	const mongoose = await createMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports nested self-referential select', async () => {
	const mongoose = await createMongoose();
	const { PostModel, AccountModel } = await getBlogModels({ mongoose });

	const accountId = createId();
	await AccountModel.create({
		_id: accountId,
		name: 'John Doe',
		email: 'johndoe@example.com',
		avatarUrl: 'https://example.com/avatar.png',
		bio: null,
		username: 'johndoe'
	} satisfies CreateInput<Blog.User>);

	const postId = createId();
	await PostModel.create({
		_id: postId,
		title: 'Post 1',
		author: accountId,
		content: 'This is the first post.',
		description: 'This is the first post.'
	} satisfies CreateInput<Blog.Post>);

	const post = (await select(PostModel.findById(postId), {
		title: true,
		author: {
			select: {
				_id: true,
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

	expect(post.title).toBe(post.author.posts[0]?.title);

	const account = (await select(AccountModel.find({}), {
		posts: {
			select: {
				author: {
					select: {
						_id: true
					}
				}
			}
		}
	}))!;
	expect(account[0]?.posts[0]?.author._id).toBe(accountId);
});
