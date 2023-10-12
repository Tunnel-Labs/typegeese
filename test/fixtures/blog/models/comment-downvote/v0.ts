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
	get _v() {
		return 'v0' as const;
	}

	@prop(
	// @ts-ignore: renamed
		foreignRef<CommentDownvote, $.User>(
			'CommentDownvote',
			'User',
			'commentDownvotes',
			{ required: true }
		)
	)
	// @ts-ignore: renamed
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
