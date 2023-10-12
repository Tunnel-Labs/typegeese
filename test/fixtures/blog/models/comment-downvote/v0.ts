import {
	ForeignRef,
	Schema,
	createMigration,
	prop,
	foreignRef
} from '~/index.js';
import type * as $ from '../$schemas.js';

export class CommentDownvote extends Schema('CommentDownvote')<
	typeof CommentDownvote
> {
	static _v = 0;

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
