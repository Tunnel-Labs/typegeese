import {
	type ForeignRef,
	type Migrate,
	Schema,
	foreignRef,
	getModelForSchema,
	prop,
	select
} from 'typegeese';
import CommentDownvoteV0 from './v0.js';
import * as $ from '../$schemas.js';

export default class CommentDownvote extends Schema(CommentDownvoteV0, {
	omit: { user: true }
})<typeof CommentDownvote> {
	static _v = 'v1-rename-account-to-user';

	@prop(
		foreignRef<CommentDownvote, $.Account>(
			'CommentDownvote',
			'Account',
			'commentDownvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	account!: ForeignRef<CommentDownvote, $.Account, 'commentDownvotes'>;

	static _migration: Migrate = async (
		migrate: Migrate<CommentDownvoteV0, CommentDownvote>
	) => {
		const { _id, mongoose } = migrate;
		const CommentDownvoteV0Model = await getModelForSchema(CommentDownvoteV0, {
			mongoose
		});

		const commentDownvote = await select(CommentDownvoteV0Model.findById(_id), {
			user: {
				select: {
					_id: true
				}
			}
		});

		if (commentDownvote === null) {
			return null;
		}

		return migrate({
			account: commentDownvote.user._id
		});
	};
}
