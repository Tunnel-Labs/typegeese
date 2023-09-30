import {
	PropType,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import { virtualForeignRef } from '../../utils/refs.js';
import { VirtualForeignRef } from '~/types/refs.js';
import * as CommentV1 from './v1-add-replies.js';
import {
	CommentUpvote,
	CommentDownvote
} from '~test/fixtures/blog/models/$schemas.js';

export class Comment extends Schema(CommentV1, 'v2-add-votes') {
	__type!: Comment;

	@prop(
		virtualForeignRef('Comment', 'Comment', 'parentComment', '_id'),
		PropType.ARRAY
	)
	public upvotes!: VirtualForeignRef<Comment, CommentUpvote, 'comment'>[];

	@prop(
		virtualForeignRef('Comment', 'Comment', 'parentComment', '_id'),
		PropType.ARRAY
	)
	public downvotes!: VirtualForeignRef<Comment, CommentDownvote, 'comment'>[];
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV1)
	.with(null)
	.migrate({});

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
