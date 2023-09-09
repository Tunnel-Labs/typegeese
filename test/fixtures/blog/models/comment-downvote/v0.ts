import {
	ForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import type { Comment, User } from '../$schemas.js';
import { foreignRef } from '../../utils/refs.js';
import { BaseSchema } from '../../../../../src/classes/$.js';

export class CommentDownvote extends BaseSchema {
	__type!: Comment;

	@prop(
		foreignRef('CommentDownvote', 'User', 'commentDownvotes', {
			required: true
		})
	)
	public user!: ForeignRef<CommentDownvote, User, 'commentDownvotes'>;

	@prop(
		foreignRef('CommentDownvote', 'Comment', 'downvotes', { required: true })
	)
	public comment!: ForeignRef<CommentDownvote, Comment, 'downvotes'>;
}

export const CommentDownvote_migration = createMigration<CommentDownvote>(null);

export const CommentDownvote_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentDownvote>({
		user: 'Cascade',
		comment: 'Cascade'
	});
