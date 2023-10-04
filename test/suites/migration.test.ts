import { beforeAll, expect, test } from 'vitest';
import { CreateInput, getModelForHyperschema, select } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { createMongoose } from '~test/utils/mongoose.js';
import * as UserV0 from '../fixtures/blog/models/_user/v0.js';
import * as PostV0 from '~test/fixtures/blog/models/post/v0.js';
import * as CommentV0 from '~test/fixtures/blog/models/comment/v0.js';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';

beforeAll(async () => {
	const mongoose = await createMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports migrations using populate', async () => {
	const mongoose = await createMongoose();
	const UserV0Model = getModelForHyperschema(UserV0, {
		mongoose
	});
	const PostV0Model = getModelForHyperschema(PostV0, {
		mongoose
	});
	const CommentV0Model = getModelForHyperschema(CommentV0, {
		mongoose
	});

	const userId = createId();
	UserV0Model.create({
		_id: userId as any,
		name: 'John Doe',
		email: 'johndoe@example.com'
	} satisfies CreateInput<UserV0.User>);

	const posts = await PostV0Model.create([
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
	] satisfies CreateInput<PostV0.Post>[]);

	await CommentV0Model.create([
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
	] satisfies CreateInput<CommentV0.Comment>[]);

	const { PostModel } = await getBlogModels({ mongoose });
	const post = await select(PostModel.findById(posts[0]!.id), {
		description: true,
		comments: {
			select: {
				author: {
					select: {
						_id: true,
						username: true,
						name: true,
						posts: {
							select: {
								_id: true,
								author: {
									select: {
										bio: true
									}
								}
							}
						}
					}
				}
			}
		}
	});

	expect(post?.description).toBe('This is th...');
	expect(post?.comments[0]?.author.username).toBe('johndoe');
	expect(post?.comments[0]?.author.posts[0]?.author.bio).toBe(null);
});
