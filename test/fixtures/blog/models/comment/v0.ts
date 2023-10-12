import { ForeignRef, Schema, prop, foreignRef } from '~/index.js';
import type * as $ from '../$schemas.js';

export class Comment extends Schema('Comment')<Comment> {
	get _v() {
		return 'v0' as const;
	}

	@prop({
		type: () => String,
		required: true
	})
	text: string;

	@prop(
		// @ts-expect-error: renamed
		foreignRef<Comment, User>('Comment', 'User', 'authoredComments', {
			required: true
		})
	)
	// @ts-expect-error: renamed
	author!: ForeignRef<Comment, $.User, 'authoredComments'>;

	@prop(
		foreignRef<Comment, $.Post>('Comment', 'Post', 'comments', {
			required: true
		})
	)
	post!: ForeignRef<Comment, $.Post, 'comments'>;
}
