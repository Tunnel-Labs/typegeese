import { beforeAll, expect, test } from 'vitest';
import { CreateInput, SelectOutput, select } from '~/index.js';
import type { Post, Comment } from '~test/fixtures/blog/models/$schemas.js';
import { createId } from '@paralleldrive/cuid2';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import type { UserV0 } from '~test/fixtures/blog/models/user/v0.js';

beforeAll(async () => {
	const mongoose = await getMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports migrations using populate', async () => {
	const { CommentModel, PostModel, UserModel } = await getModels();

	const userId = createId();
	await UserModel.collection.insertOne({
		_id: userId as any,
		_v: 0,
		name: 'John Doe',
		email: 'johndoe@example.com'
	} satisfies Omit<CreateInput<UserV0>, 'username'> & { _v: 0 });

	const posts = await PostModel.create([
		{
			_id: createId(),
			title: 'Post 1',
			author: userId,
			content: 'This is the first post.'
		},
		{
			_id: createId(),
			title: 'Post 2',
			author: userId,
			content: 'This is the second post.'
		},
		{
			_id: createId(),
			title: 'Post 3',
			author: userId,
			content: 'This is the third post.'
		}
	] satisfies CreateInput<Post>[]);

	const comments = await CommentModel.create([
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the first post.'
		},
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the second post.'
		},
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the third post.'
		},
		{
			_id: createId(),
			author: userId,
			post: posts[1]!.id,
			text: 'This is the second comment on the first post.'
		},
		{
			_id: createId(),
			author: userId,
			post: posts[1]!.id,
			text: 'This is the second comment on the second post.'
		},
		{
			_id: createId(),
			author: userId,
			post: posts[2]!.id,
			text: 'This is the third comment on the third post.'
		}
	] satisfies CreateInput<Comment>[]);

	const post = await select(PostModel.findById(posts[0]!.id), {
		comments: {
			select: {
				author: {
					select: {
						_id: true,
						username: true
					}
				}
			}
		}
	});

	expect(post.comments[0]!.author.username).toBe('johndoe');
});
