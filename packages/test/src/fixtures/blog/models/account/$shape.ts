import { t } from '@typegeese/shape';

import type { AccountShape } from './$schema.js';

export const Account = t.Shape<AccountShape>({
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
