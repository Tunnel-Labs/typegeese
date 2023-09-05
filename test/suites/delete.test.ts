import { beforeAll, expect, test } from 'vitest';
import { CreateInput } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import { User, Post, Comment } from '~test/fixtures/blog/models/$schemas.js';

beforeAll(async () => {
	const mongoose = await getMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports cascade deletes', async () => {
	const { PostModel, UserModel, CommentModel } = await getModels();

	const userId = createId();
	await UserModel.create({
		_id: userId,
		name: 'John Doe',
		email: 'johndoe@example.com',
		avatarUrl: 'https://example.com/avatar.png',
		bio: null,
		username: 'johndoe'
	} satisfies CreateInput<User>);

	const posts = await PostModel.create([
		{
			_id: createId(),
			title: 'Post 1',
			author: userId,
			content: 'This is the first post.',
			description: 'This is the first post.'
		},
		{
			_id: createId(),
			title: 'Post 2',
			author: userId,
			content: 'This is the second post.',
			description: 'This is the second post.'
		},
		{
			_id: createId(),
			title: 'Post 3',
			author: userId,
			content: 'This is the third post.',
			description: 'This is the third post.'
		}
	] satisfies CreateInput<Post>[]);

	await CommentModel.create([
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the first post.',
			parentComment: null
		},
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the second post.',
			parentComment: null
		},
		{
			_id: createId(),
			author: userId,
			post: posts[0]!.id,
			text: 'This is the first comment on the third post.',
			parentComment: null
		},
		{
			_id: createId(),
			author: userId,
			post: posts[1]!.id,
			text: 'This is the second comment on the first post.',
			parentComment: null
		},
		{
			_id: createId(),
			author: userId,
			post: posts[1]!.id,
			text: 'This is the second comment on the second post.',
			parentComment: null
		},
		{
			_id: createId(),
			author: userId,
			post: posts[2]!.id,
			text: 'This is the third comment on the third post.',
			parentComment: null
		}
	] satisfies CreateInput<Comment>[]);

	await UserModel.deleteOne({ _id: userId });

	expect(await PostModel.count({})).toBe(0);
	expect(await CommentModel.count({})).toBe(0);
});
