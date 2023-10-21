import { t } from '@typegeese/shape';
import type { CommentUpvoteShape } from './$schema.js';

export const CommentUpvote = t.Shape<CommentUpvoteShape>({
	_id: t,
	account: t.ForeignRef('Account'),
	comment: t.ForeignRef('Comment')
});
