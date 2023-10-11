import { ForeignRef, Schema, prop, foreignRef } from '~/index.js';
import type { Comment, User } from '../$schemas.js';

export class CommentUpvote extends Schema('CommentUpvote')<CommentUpvote> {
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
