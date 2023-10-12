import { ForeignRef, Schema, prop, foreignRef } from '~/index.js';
import type * as $ from '../$schemas.js';

export class CommentUpvote extends Schema('CommentUpvote')<
	typeof CommentUpvote
> {
	static _v = 0;

	@prop(
		// @ts-ignore: renamed
		foreignRef<CommentUpvote, $.User>(
			'CommentUpvote',
			'User',
			'commentUpvotes',
			{
				required: true
			}
		)
	)
	// @ts-ignore: renamed
	user!: ForeignRef<CommentUpvote, $.User, 'commentUpvotes'>;

	@prop(
		foreignRef<CommentUpvote, $.Comment>(
			'CommentUpvote',
			'Comment',
			'upvotes',
			{
				required: true
			}
		)
	)
	comment!: ForeignRef<CommentUpvote, $.Comment, 'upvotes'>;
}
