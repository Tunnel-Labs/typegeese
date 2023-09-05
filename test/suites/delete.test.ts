import { beforeAll, expect, test } from 'vitest';
import { CreateInput } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import { User, Post } from '~test/fixtures/blog/models/$schemas.js';

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

	const postId = createId();
	await PostModel.create({
		_id: postId,
		title: 'Post 1',
		author: userId,
		content: 'This is the first post.',
		description: 'This is the first post.'
	} satisfies CreateInput<Post>);

	await PostModel.deleteOne({
		_id: postId
	});

	expect(await UserModel.findById(userId)).toBe(null);
});
