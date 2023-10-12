import { ForeignRef, Schema, prop, foreignRef } from '~/index.js';
import type { Post, User } from '../$schemas.js';

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
		foreignRef<Comment, User>('Comment', 'User', 'authoredComments', {
			required: true
		})
	)
	author!: ForeignRef<Comment, User, 'authoredComments'>;

	@prop(
		foreignRef<Comment, Post>('Comment', 'Post', 'comments', { required: true })
	)
	post!: ForeignRef<Comment, Post, 'comments'>;
}
