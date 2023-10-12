import {
	ForeignRef,
	Schema,
	createMigration,
	foreignRef,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';

import * as CommentUpvoteV0 from './v0.js';
import * as $ from '../$schemas.js';

export class CommentUpvote extends Schema(CommentUpvoteV0, {
	omit: { user: true }
})<typeof CommentUpvote> {
	static _v = 'v1-rename-account-to-user';

	@prop(
		foreignRef<CommentUpvote, $.Account>(
			'CommentUpvote',
			'Account',
			'commentUpvotes',
			{ required: true }
		)
	)
	account!: ForeignRef<CommentUpvote, $.Account, 'commentUpvotes'>;

	static migration: typeof CommentUpvote_migration;
}

export const CommentUpvote_migration = createMigration<CommentUpvote>()
	.from(CommentUpvoteV0)
	.with(async function ({ _id }) {
		const CommentUpvoteV0Model = await getModelForHyperschema(CommentUpvoteV0, {
			mongoose: this.mongoose
		});

		const commentUpvote = await select(CommentUpvoteV0Model.findById(_id), {
			user: {
				select: {
					_id: true
				}
			}
		});

		return commentUpvote;
	})
	.migrate({
		account() {
			return this.user._id;
		}
	});
