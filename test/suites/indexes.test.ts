import { expect, test } from 'vitest';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';
import { createMongoose } from '~test/utils/mongoose.js';

test('lower indexes', async () => {
	const mongoose = await createMongoose();
	const { UserModel } = await getBlogModels({ mongoose });
	const userIndexes = await UserModel.listIndexes();
	// Should only contain the `_id` index
	expect(userIndexes.length).toBe(1);
});
