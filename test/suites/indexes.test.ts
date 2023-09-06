import { expect, test } from 'vitest';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';
import { createMongoose } from '~test/utils/mongoose.js';

test('lower indexes', async () => {
	const mongoose = await createMongoose();
	const { PostModel } = await getBlogModels({ mongoose });
	const postIndexes = await PostModel.listIndexes();
	// Should only contain the `_id` index
	expect(postIndexes.length).toBe(1);
});
