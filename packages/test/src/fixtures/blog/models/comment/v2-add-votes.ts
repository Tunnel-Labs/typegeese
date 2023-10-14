import {
	type Migrate,
	PropType,
	Schema,
	prop,
	virtualForeignRef,
	type VirtualForeignRef
} from 'typegeese';
import CommentV1 from './v1-add-replies.js';

import type * as $ from '../$schemas.js';

export default class Comment extends Schema(CommentV1)<typeof Comment> {
	static _v = 'v2-add-votes';

	@prop(
		virtualForeignRef<Comment, $.Comment>(
			'Comment',
			'Comment',
			'parentComment'
		),
		PropType.ARRAY
	)
	upvotes!: VirtualForeignRef<Comment, $.CommentUpvote, 'comment'>[];

	@prop(
		virtualForeignRef<Comment, $.Comment>(
			'Comment',
			'Comment',
			'parentComment'
		),
		PropType.ARRAY
	)
	downvotes!: VirtualForeignRef<Comment, $.CommentDownvote, 'comment'>[];

	static _migration = (migrate: Migrate<CommentV1, Comment>) => migrate({});
}
