import {
	PropType,
	Schema,
	createMigration,
	prop,
	virtualForeignRef
} from '~/index.js';
import { VirtualForeignRef } from '~/types/refs.js';
import * as CommentV1 from './v1-add-replies.js';
import {
	CommentUpvote,
	CommentDownvote
} from '~test/fixtures/blog/models/$schemas.js';

export class Comment extends Schema(CommentV1)<Comment> {
	get _v() {
		return 'v2-add-votes';
	}

	@prop(
		virtualForeignRef<Comment, Comment>(
			'Comment',
			'Comment',
			'parentComment',
			'_id'
		),
		PropType.ARRAY
	)
	upvotes!: VirtualForeignRef<Comment, CommentUpvote, 'comment'>[];

	@prop(
		virtualForeignRef<Comment, Comment>(
			'Comment',
			'Comment',
			'parentComment',
			'_id'
		),
		PropType.ARRAY
	)
	downvotes!: VirtualForeignRef<Comment, CommentDownvote, 'comment'>[];

	__migration__: typeof Comment_migration;
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV1)
	.with(null)
	.migrate({});
