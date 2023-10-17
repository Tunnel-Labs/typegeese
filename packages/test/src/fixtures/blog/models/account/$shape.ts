import { t } from '@typegeese/shape';

import type { $Account } from './$schema.js';

export const Account = t.Shape<$Account>({
	_id: t,
	authoredComments: t.VirtualForeignRef('Comment'),
	avatarUrl: t,
	bio: t,
	commentDownvotes: t.VirtualForeignRef('CommentDownvote'),
	commentUpvotes: t.VirtualForeignRef('CommentUpvote'),
	email: t,
	name: t,
	posts: t.VirtualForeignRef('Post'),
	username: t
});
