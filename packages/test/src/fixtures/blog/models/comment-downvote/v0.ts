import { ForeignRef, Schema, prop, foreignRef } from 'typegeese';
import type * as $ from '../$schemas.js';

export default class CommentDownvote extends Schema('CommentDownvote')<
	typeof CommentDownvote
> {
	static _v = 0;

	@prop(
		// @ts-ignore: renamed
		foreignRef<CommentDownvote, $.User>(
			'CommentDownvote',
			'User',
			'commentDownvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	// @ts-ignore: renamed
	user!: ForeignRef<CommentDownvote, $.User, 'commentDownvotes'>;

	@prop(
		foreignRef<CommentDownvote, $.Comment>(
			'CommentDownvote',
			'Comment',
			'downvotes',
			{ required: true, onDelete: 'Cascade' }
		)
	)
	comment!: ForeignRef<CommentDownvote, $.Comment, 'downvotes'>;
}
