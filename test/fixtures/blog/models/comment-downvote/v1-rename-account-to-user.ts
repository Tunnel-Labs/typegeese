import {
	ForeignRef,
	Schema,
	createMigration,
	foreignRef,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';
import * as CommentDownvoteV0 from './v0.js';
import * as $ from '../$schemas.js';

export class CommentDownvote extends Schema(CommentDownvoteV0, {
	omit: { user: true }
})<typeof CommentDownvote> {
	static _v = 'v1-rename-account-to-user';

	@prop(
		foreignRef<CommentDownvote, $.Account>(
			'CommentDownvote',
			'Account',
			'commentDownvotes',
			{ required: true }
		)
	)
	account!: ForeignRef<CommentDownvote, $.Account, 'commentDownvotes'>;

	static migration: typeof CommentDownvote_migration;
}

export const CommentDownvote_migration = createMigration<CommentDownvote>()
	.from(CommentDownvoteV0)
	.with(async function ({ _id }) {
		const CommentDownvoteV0Model = await getModelForHyperschema(
			CommentDownvoteV0,
			{ mongoose: this.mongoose }
		);

		const commentDownvote = await select(CommentDownvoteV0Model.findById(_id), {
			user: {
				select: {
					_id: true
				}
			}
		});

		return commentDownvote;
	})
	.migrate({
		account() {
			return this.user._id;
		}
	});
