import {
	type ForeignRef,
	PropType,
	Schema,
	prop,
	foreignRef,
	virtualForeignRef,
	Migrate,
	type VirtualForeignRef
} from 'typegeese';
import CommentV0 from './v0.js';

import type * as $ from '../$schemas.js';

export default class Comment extends Schema(CommentV0)<typeof Comment> {
	static _v = 'v1-add-replies';

	@prop(
		foreignRef<Comment, $.Comment>('Comment', 'Comment', 'replies', {
			required: false,
			onDelete: 'Cascade'
		})
	)
	parentComment!: ForeignRef<Comment, $.Comment, 'replies'> | null;

	@prop(
		virtualForeignRef<Comment, $.Comment>(
			'Comment',
			'Comment',
			'parentComment'
		),
		PropType.ARRAY
	)
	replies!: VirtualForeignRef<Comment, $.Comment, 'parentComment'>[];

	static _migration = (migrate: Migrate<CommentV0, Comment>) =>
		migrate({ parentComment: null });
}
