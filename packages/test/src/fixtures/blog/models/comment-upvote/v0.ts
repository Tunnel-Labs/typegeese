import { type ForeignRef, Schema, prop, foreignRef } from 'typegeese';

import type * as $ from '../$schemas.js';

export default class CommentUpvote extends Schema('CommentUpvote')<
	typeof CommentUpvote
> {
	static _v = 0;

	@prop(
		// @ts-ignore: renamed
		foreignRef<CommentUpvote, $.User>(
			'CommentUpvote',
			'User',
			'commentUpvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	// @ts-ignore: renamed
	user!: ForeignRef<CommentUpvote, $.User, 'commentUpvotes'>;

	@prop(
		foreignRef<CommentUpvote, $.Comment>(
			'CommentUpvote',
			'Comment',
			'upvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	comment!: ForeignRef<CommentUpvote, $.Comment, 'upvotes'>;
}
