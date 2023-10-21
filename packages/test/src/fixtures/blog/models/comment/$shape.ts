import { t } from '@typegeese/shape';

import type { CommentShape } from './$schema.js';

export const Comment = t.Shape<CommentShape>({
	_id: t,
	author: t.ForeignRef('Account'),
	downvotes: t.VirtualForeignRef('CommentDownvote'),
	parentComment: t.ForeignRef('Comment'),
	post: t.ForeignRef('Post'),
	rawText: t,
	replies: t.VirtualForeignRef('Comment'),
	upvotes: t.VirtualForeignRef('CommentUpvote')
});
