import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	foreignRef,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';

import * as CommentUpvoteV0 from './v0.js';
import * as $ from '../$schemas.js';

export class CommentUpvote extends Schema(
	CommentUpvoteV0,
	'v1-rename-account-to-user',
	{ omit: { user: true } }
) {
	__type__!: CommentUpvote;

	@prop(
		foreignRef<CommentUpvote, $.Account>(
			'CommentUpvote',
			'Account',
			'commentUpvotes',
			{ required: true }
		)
	)
	account!: ForeignRef<CommentUpvote, $.Account, 'commentUpvotes'>;
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

export const CommentUpvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentUpvote>({
		account: 'Cascade',
		comment: 'Cascade'
	});
