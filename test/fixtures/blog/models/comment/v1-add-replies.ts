import {
	ForeignRef,
	PropType,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	foreignRef,
	virtualForeignRef
} from '~/index.js';
import * as CommentV0 from './v0.js';
import { VirtualForeignRef } from '~/types/refs.js';
import * as $ from './$schema.js';

export class Comment extends Schema(CommentV0, 'v1-add-replies') {
	__type__!: Comment;

	@prop(
		foreignRef<Comment, $.Comment>('Comment', 'Comment', 'replies', {
			required: false
		})
	)
	parentComment!: ForeignRef<Comment, $.Comment, 'replies'> | null;

	@prop(
		virtualForeignRef<Comment, $.Comment>(
			'Comment',
			'Comment',
			'parentComment',
			'_id'
		),
		PropType.ARRAY
	)
	replies!: VirtualForeignRef<Comment, $.Comment, 'parentComment'>[];
}

export const Comment_migration = createMigration<Comment>()
	.from(CommentV0)
	.with(() => {})
	.migrate({
		parentComment() {
			return null;
		}
	});

export const Comment_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Comment>({
		author: 'Cascade',
		post: 'Cascade',
		parentComment: 'Cascade'
	});
