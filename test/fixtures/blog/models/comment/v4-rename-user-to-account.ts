import {
	ForeignRef,
	Schema,
	createMigration,
	foreignRef,
	prop
} from '~/index.js';
import * as CommentV3 from './v3-rename-to-raw-text.js';
import type * as $ from '../$schemas.js';

export class Comment extends Schema(CommentV3, {
	omit: { author: true }
})<Comment> {
	get _v() {
		return 'v4-rename-user-to-account';
	}

	@prop(
		foreignRef<Comment, $.Account>('Comment', 'Account', 'authoredComments', {
			required: true
		})
	)
	author!: ForeignRef<Comment, $.Account, 'authoredComments'>;

	__migration__: typeof Comment_migration;
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV3)
	.with(null)
	.migrate({});
