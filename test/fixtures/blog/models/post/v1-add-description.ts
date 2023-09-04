import {
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';
import * as PostV0 from './v0.js';
import { getMongoose } from '~test/utils/mongoose.js';

export class Post extends Schema(PostV0, 'v1-add-description') {
	__self!: Post;

	@prop({ type: () => String, required: true })
	public description!: string;
}

export const Post_migration = createMigration<Post>()
	.from(PostV0)
	.with(async ({ _id }) => {
		const PostV0Model = getModelForHyperschema(PostV0, {
			mongoose: await getMongoose()
		});
		const post = await select(PostV0Model.findById(_id), { content: true });
		return post;
	})
	.migrate({
		description() {
			return this.content.slice(0, 10) + '...';
		}
	});

export const Post_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Post>({
		author: 'Cascade'
	});
