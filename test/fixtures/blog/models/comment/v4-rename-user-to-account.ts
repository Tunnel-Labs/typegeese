import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	foreignRef,
	prop
} from '~/index.js';
import * as CommentV3 from './v3-rename-to-raw-text.js';
import type * as $ from '../$schemas.js';

export class Comment extends Schema(CommentV3, 'v4-rename-user-to-account', {
	omit: { author: true }
}) {
	__type__!: Comment;

	@prop(
		foreignRef<Comment, $.Account>('Comment', 'Account', 'authoredComments', {
			required: true
		})
	)
	author!: ForeignRef<Comment, $.Account, 'authoredComments'>;
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV3)
	.with(null)
	.migrate({});

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
