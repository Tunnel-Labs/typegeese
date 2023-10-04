// @ts-nocheck

import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	foreignRef
} from '~/index.js';
import type * as $ from '../$schemas.js';

export class CommentDownvote extends Schema('CommentDownvote') {
	__type__!: CommentDownvote;

	@prop(
		foreignRef<CommentDownvote, $.User>(
			'CommentDownvote',
			'User',
			'commentDownvotes',
			{ required: true }
		)
	)
	public user!: ForeignRef<CommentDownvote, $.User, 'commentDownvotes'>;

	@prop(
		foreignRef<CommentDownvote, $.Comment>(
			'CommentDownvote',
			'Comment',
			'downvotes',
			{ required: true }
		)
	)
	public comment!: ForeignRef<CommentDownvote, $.Comment, 'downvotes'>;
}

export const CommentDownvote_migration = createMigration<CommentDownvote>(null);

export const CommentDownvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentDownvote>({
		user: 'Cascade',
		comment: 'Cascade'
	});
