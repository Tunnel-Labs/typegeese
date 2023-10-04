// @ts-nocheck

import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	foreignRef
} from '~/index.js';
import type { Comment, User } from '../$schemas.js';

export class CommentUpvote extends Schema('CommentUpvote') {
	__type__!: CommentUpvote;

	@prop(
		foreignRef<CommentUpvote, User>('CommentUpvote', 'User', 'commentUpvotes', {
			required: true
		})
	)
	user!: ForeignRef<CommentUpvote, User, 'commentUpvotes'>;

	@prop(
		foreignRef<CommentUpvote, Comment>('CommentUpvote', 'Comment', 'upvotes', {
			required: true
		})
	)
	comment!: ForeignRef<CommentUpvote, Comment, 'upvotes'>;
}

export const CommentUpvote_migration = createMigration<CommentUpvote>(null);

export const CommentUpvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
