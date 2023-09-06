import { beforeAll, expect, test } from 'vitest';
import { CreateInput, select } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';
import { getTunnelModels } from '~test/fixtures/tunnel/models/$models.js';
import { getMongoose } from '~test/utils/mongoose.js';
import * as Blog from '~test/fixtures/blog/models/$schemas.js';
import * as Tunnel from '~test/fixtures/tunnel/models/$schemas.js';
import { CommentThread } from '~test/fixtures/tunnel/models/$schemas.js';

beforeAll(async () => {
	const mongoose = await getMongoose();
	mongoose.connection.db.dropDatabase();
});

test('supports nested self-referential select', async () => {
	const { PostModel, UserModel } = await getBlogModels();

	const userId = createId();
	await UserModel.create({
		_id: userId,
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
		author: userId,
		content: 'This is the first post.',
		description: 'This is the first post.'
	} satisfies CreateInput<Blog.Post>);

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

	expect(post.title).toBe(post.author.posts[0]?.title);

	const user = (await select(UserModel.findById(userId), {
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
	expect(user.posts[0]?.author._id).toBe(userId);
});

test('supports nested self-referential select (tunnel)', async () => {
	const { CommentThreadModel, CommentModel } = await getTunnelModels();

	const commentThreadId = createId();
	await CommentThreadModel.create({
		_id: commentThreadId
	} satisfies CreateInput<Tunnel.CommentThread>);

	const commentId = createId();
	await CommentModel.create({
		_id: commentId,
		parentCommentThread: commentThreadId,
		rawText: 'This is a comment.'
	} satisfies CreateInput<Tunnel.Comment>);

	const commentThreads = (await select(CommentThreadModel.find({}), {
		comments: {
			select: {
				parentCommentThread: {
					select: {
						_id: true
					}
				}
			}
		}
	}))!;

	expect(commentThreads[0]?.comments[0]?.parentCommentThread._id).toBe(
		commentThreadId
	);
});
