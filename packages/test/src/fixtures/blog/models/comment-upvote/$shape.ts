import { t } from '@typegeese/shape';
import type { $CommentUpvote } from './$schema.js';

export const CommentUpvote = t.Shape<$CommentUpvote>({
	_id: t,
	account: t.ForeignRef,
	comment: t.ForeignRef
});
