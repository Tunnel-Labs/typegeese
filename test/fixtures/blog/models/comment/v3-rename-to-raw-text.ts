import {
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';
import * as CommentV2 from './v2-add-votes.js';

export class Comment extends Schema(CommentV2, 'v3-rename-to-raw-text', {
	omit: { text: true }
}) {
	__type__!: Comment;

	@prop({
		type: () => String,
		required: true
	})
	rawText!: string;
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

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
