import type { ForeignRef } from '~/index.js';
import {
	Schema,
	prop,
	defineRelations,
	createMigration,
	foreignRef
} from '~/index.js';

import type { CommentThread } from '../$schemas.js';

export class Comment extends Schema('Comment') {
	declare __type__: Comment;

	@prop({
		type: () => String,
		required: true
	})
	rawText!: string;

	@prop(
		foreignRef<Comment, CommentThread>('Comment', 'CommentThread', 'comments', {
			required: true
		})
	)
	parentCommentThread!: ForeignRef<Comment, CommentThread, 'comments'>;
}

export const Comment_relations =
	defineRelations<Comment>({
		parentCommentThread: 'Cascade'
	});

export const Comment_migration = createMigration<Comment>(null);
