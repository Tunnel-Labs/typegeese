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
import * as CommentDownvoteV0 from './v0.js';
import * as $ from '../$schemas.js';

export class CommentDownvote extends Schema(
	CommentDownvoteV0,
	'v1-rename-account-to-user',
	{ omit: { user: true } }
) {
	__type__!: CommentDownvote;

	@prop(
		foreignRef<CommentDownvote, $.Account>(
			'CommentDownvote',
			'Account',
			'commentDownvotes',
			{ required: true }
		)
	)
	public account!: ForeignRef<CommentDownvote, $.Account, 'commentDownvotes'>;
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

export const CommentDownvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentDownvote>({
		account: 'Cascade',
		comment: 'Cascade'
	});
