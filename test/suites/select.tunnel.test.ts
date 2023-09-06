import { beforeAll, expect, test } from 'vitest';
import { CreateInput, select } from '~/index.js';
import { createId } from '@paralleldrive/cuid2';
import { getTunnelModels } from '~test/fixtures/tunnel/models/$models.js';
import { createMongoose } from '~test/utils/mongoose.js';
import * as Tunnel from '~test/fixtures/tunnel/models/$schemas.js';

beforeAll(async () => {
	const mongoose = await createMongoose();
	mongoose.connection.db.dropDatabase();
	for (const modelName of mongoose.modelNames()) {
		mongoose.deleteModel(modelName);
	}
});

test.skip('supports nested self-referential select (tunnel)', async () => {
	const mongoose = await createMongoose();
	const { CommentThreadModel, CommentModel } = await getTunnelModels({
		mongoose
	});

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
