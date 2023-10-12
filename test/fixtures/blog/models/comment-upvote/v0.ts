import { ForeignRef, Schema, prop, foreignRef } from '~/index.js';
import type * as $ from '../$schemas.js';

export class CommentUpvote extends Schema('CommentUpvote')<CommentUpvote> {
	get _v() {
		return 'v0' as const;
	}

	@prop(
		// @ts-expect-error: renamed
		foreignRef<CommentUpvote, $.User>(
			'CommentUpvote',
			'User',
			'commentUpvotes',
			{
				required: true
			}
		)
	)
	// @ts-expect-error: renamed
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
