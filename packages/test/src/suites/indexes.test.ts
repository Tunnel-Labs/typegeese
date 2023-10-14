import { expect, test } from 'vitest';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';
import { createMongoose } from '~test/utils/mongoose.js';

test('lower indexes', async () => {
	const mongoose = await createMongoose();
	const { AccountModel } = await getBlogModels({ mongoose });
	await AccountModel.syncIndexes();
	const indexes = await AccountModel.listIndexes();
	expect(indexes.length).toBe(1);
});
