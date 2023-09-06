import { expect, test } from 'vitest';
import { getBlogModels } from '~test/fixtures/blog/models/$models.js';
import { createMongoose } from '~test/utils/mongoose.js';

test('lower indexes', async () => {
	const mongoose = await createMongoose();
	const { UserModel } = await getBlogModels({ mongoose });
	await UserModel.syncIndexes();
	const indexes = await UserModel.listIndexes();
	console.log(indexes);
	expect(indexes.length).toBe(1);
});
