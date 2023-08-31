import {
	ForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import type { Comment, User } from '../$schemas.js';
import { foreignRef } from '../../utils/refs.js';
import { BaseSchema } from '~/classes/index.js';

export class CommentDownvote extends BaseSchema {
	__self!: Comment;

	@prop(foreignRef('User', 'commentDownvotes', { required: true }))
	public user!: ForeignRef<CommentDownvote, User, 'commentDownvotes'>;

	@prop(foreignRef('Comment', 'downvotes', { required: true }))
	public comment!: ForeignRef<CommentDownvote, Comment, 'downvotes'>;
}

export const CommentDownvote_migration = createMigration<CommentDownvote>(null);

export const CommentDownvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentDownvote>({
		user: 'Cascade',
		comment: 'Cascade'
	});
