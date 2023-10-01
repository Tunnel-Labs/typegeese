import type { VirtualForeignRef } from '~/index.js';
import {
	createMigration,
	Schema,
	prop,
	PropType,
	defineOnForeignModelDeletedActions,
	virtualForeignRef
} from '~/index.js';

import type { Comment } from '../$schemas.js';

export class CommentThread extends Schema('CommentThread') {
	declare __type__: CommentThread;

	@prop(
		virtualForeignRef<CommentThread, Comment>(
			'CommentThread',
			'Comment',
			'parentCommentThread',
			'_id'
		),
		PropType.ARRAY
	)
	public comments!: VirtualForeignRef<
		CommentThread,
		Comment,
		'parentCommentThread'
	>[];
}

export const CommentThread_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<CommentThread>({});

export const CommentThread_migration = createMigration<CommentThread>(null);
