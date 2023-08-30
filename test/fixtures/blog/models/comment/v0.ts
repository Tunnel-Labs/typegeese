import {
	ForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import type { Post, User } from '../$schemas.js';
import { foreignRef } from '../../utils/refs.js';
import { BaseSchema } from '~/classes/index.js';

export class Comment extends BaseSchema {
	__self!: Comment;

	@prop({
		type: () => String,
		required: true
	})
	public text: string;

	@prop(foreignRef('User', 'authoredComments', { required: true }))
	public author!: ForeignRef<Comment, User, 'authoredComments'>;

	@prop(foreignRef('Post', 'comments', { required: true }))
	public post!: ForeignRef<Comment, Post, 'comments'>;
}

export const Comment_migration = createMigration<Comment>(null);

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade'
	});
