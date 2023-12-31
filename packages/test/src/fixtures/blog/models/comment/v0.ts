import { type ForeignRef, Schema, prop, foreignRef } from 'typegeese';

import type * as $ from '../$schemas.js';

export default class Comment extends Schema('Comment')<typeof Comment> {
	static _v = 0;

	@prop({ type: String, required: true })
	text: string;

	@prop(
		// @ts-ignore: renamed
		foreignRef<Comment, User>('Comment', 'User', 'authoredComments', {
			required: true
		})
	)
	// @ts-ignore: renamed
	author!: ForeignRef<Comment, $.User, 'authoredComments'>;

	@prop(
		foreignRef<Comment, $.Post>('Comment', 'Post', 'comments', {
			required: true,
			onDelete: 'Cascade'
		})
	)
	post!: ForeignRef<Comment, $.Post, 'comments'>;
}
