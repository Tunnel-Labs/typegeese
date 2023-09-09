import {
	ForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import type { Comment, Post, User } from '../$schemas.js';
import { foreignRef } from '../../utils/refs.js';
import { BaseSchema } from '../../../../../src/classes/$.js';

export class CommentUpvote extends BaseSchema {
	__type!: Comment;

	@prop(
		foreignRef('CommentUpvote', 'User', 'commentUpvotes', { required: true })
	)
	public user!: ForeignRef<CommentUpvote, User, 'commentUpvotes'>;

	@prop(foreignRef('CommentUpvote', 'Comment', 'upvotes', { required: true }))
	public comment!: ForeignRef<CommentUpvote, Comment, 'upvotes'>;
}

export const CommentUpvote_migration = createMigration<CommentUpvote>(null);

export const CommentUpvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
