import { t } from '@typegeese/shape';

import type { $Comment } from './$schema.js';

export const Comment = t.Shape<$Comment>({
	_id: t,
	author: t.ForeignRef,
	downvotes: t.VirtualForeignRef,
	parentComment: t.ForeignRef,
	post: t.ForeignRef,
	rawText: t,
	replies: t.VirtualForeignRef,
	upvotes: t.VirtualForeignRef
});
