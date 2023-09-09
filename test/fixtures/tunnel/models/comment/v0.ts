import type { ForeignRef } from '~/index.js';
import {
	BaseSchema,
	prop,
	defineOnForeignModelDeletedActions,
	createMigration
} from '~/index.js';

import type { CommentThread } from '../$schemas.js';
import { foreignRef } from '../../utils/refs.js';

export class Comment extends BaseSchema {
	declare __type: Comment;

	@prop({
		type: () => String,
		required: true
	})
	public rawText!: string;

	@prop(foreignRef('Comment', 'CommentThread', 'comments', { required: true }))
	public parentCommentThread!: ForeignRef<Comment, CommentThread, 'comments'>;
}

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		parentCommentThread: 'Cascade'
	});

export const Comment_migration = createMigration<Comment>(null);
