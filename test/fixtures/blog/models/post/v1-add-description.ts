import {
	Schema,
	createMigration,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';
import * as PostV0 from './v0.js';

export class Post extends Schema(PostV0)<Post> {
	get _v() {
		return 'v1-add-description';
	}

	@prop({ type: () => String, required: true })
	description!: string;

	__migration__: typeof Post_migration;
}

export const Post_migration = createMigration<Post>()
	.from(PostV0)
	.with(async function ({ _id }) {
		const PostV0Model = getModelForHyperschema(PostV0, {
			mongoose: this.mongoose
		});
		const post = await select(PostV0Model.findById(_id), { content: true });
		return post;
	})
	.migrate({
		description() {
			return this.content.slice(0, 10) + '...';
		}
	});
