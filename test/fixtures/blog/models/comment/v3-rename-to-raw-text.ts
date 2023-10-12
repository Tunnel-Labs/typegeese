import {
	Schema,
	createMigration,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';
import * as CommentV2 from './v2-add-votes.js';

export class Comment extends Schema(CommentV2, {
	omit: { text: true }
})<typeof Comment> {
	static _v = 'v3-rename-to-raw-text';

	@prop({
		type: String,
		required: true
	})
	rawText!: string;

	static migration: typeof Comment_migration;
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV2)
	.with(async function ({ _id }) {
		const CommentV2Model = getModelForHyperschema(CommentV2, {
			mongoose: this.mongoose
		});
		const comment = await select(CommentV2Model.findById(_id), { text: true });
		return comment;
	})
	.migrate({
		rawText() {
			return this.text;
		}
	});
