import type { VirtualForeignRef } from '~/index.js';
import {
	createMigration,
	BaseSchema,
	prop,
	PropType,
	defineOnForeignModelDeletedActions
} from '~/index.js';

import type { Comment } from '../$schemas.js';
import { virtualForeignRef } from '../../utils/refs.js';

export class CommentThread extends BaseSchema {
	declare __type: CommentThread;

	@prop(
		virtualForeignRef('CommentThread', 'Comment', 'parentCommentThread', '_id'),
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
