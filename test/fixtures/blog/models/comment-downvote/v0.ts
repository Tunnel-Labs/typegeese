import {
	ForeignRef,
	Schema,
	createMigration,
	prop,
	foreignRef
} from '~/index.js';
import type * as $ from '../$schemas.js';

export class CommentDownvote extends Schema(
	'CommentDownvote'
)<CommentDownvote> {
	@prop(
		foreignRef<CommentDownvote, $.User>(
			'CommentDownvote',
			'User',
			'commentDownvotes',
			{ required: true }
		)
	)
	user!: ForeignRef<CommentDownvote, $.User, 'commentDownvotes'>;

	@prop(
		foreignRef<CommentDownvote, $.Comment>(
			'CommentDownvote',
			'Comment',
			'downvotes',
			{ required: true }
		)
	)
	comment!: ForeignRef<CommentDownvote, $.Comment, 'downvotes'>;
}

export const CommentDownvote_migration = createMigration<CommentDownvote>(null);
