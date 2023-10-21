import { t } from '@typegeese/shape';

import type { CommentDownvoteShape } from './$schema.js';

export const CommentDownvote = t.Shape<CommentDownvoteShape>({
	_id: t,
	account: t.ForeignRef('Account'),
	comment: t.ForeignRef('Comment')
});
