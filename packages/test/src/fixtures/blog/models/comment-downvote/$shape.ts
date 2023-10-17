import { t } from '@typegeese/shape';

import type { $CommentDownvote } from './$schema.js';

export const CommentDownvote = t.Shape<$CommentDownvote>({
	_id: t,
	account: t.ForeignRef('Account'),
	comment: t.ForeignRef('Comment')
});
