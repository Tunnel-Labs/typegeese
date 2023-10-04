// @ts-nocheck

import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	foreignRef
} from '~/index.js';
import type { Post, User } from '../$schemas.js';

export class Comment extends Schema('Comment') {
	__type__!: Comment;

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

export const Comment_migration = createMigration<Comment>(null);

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade'
	});
