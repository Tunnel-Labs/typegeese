import {
	type ForeignRef,
	Migrate,
	Schema,
	foreignRef,
	getModelForSchema,
	prop,
	select
} from 'typegeese';

import CommentUpvoteV0 from './v0.js';
import type * as $ from '../$schemas.js';

export default class CommentUpvote extends Schema(CommentUpvoteV0, {
	omit: { user: true }
})<typeof CommentUpvote> {
	static _v = 'v1-rename-account-to-user';

	@prop(
		foreignRef<CommentUpvote, $.Account>(
			'CommentUpvote',
			'Account',
			'commentUpvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	account!: ForeignRef<CommentUpvote, $.Account, 'commentUpvotes'>;

	static _migration: Migrate = async (
		migrate: Migrate<CommentUpvoteV0, CommentUpvote>
	) => {
		const { _id, mongoose } = migrate;
		const CommentUpvoteV0Model = await getModelForSchema(CommentUpvoteV0, {
			mongoose
		});

		const commentUpvote = await select(CommentUpvoteV0Model.findById(_id), {
			user: {
				select: {
					_id: true
				}
			}
		});

		if (commentUpvote === null) {
			return null;
		}

		return migrate({
			account: commentUpvote.user._id
		});
	};
}
