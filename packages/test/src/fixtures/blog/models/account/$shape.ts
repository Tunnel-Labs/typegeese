import { t } from '@typegeese/shape';

import type { $Account } from './$schema.js';

export const Account = t.Shape<$Account>({
	_id: t,
	authoredComments: t.VirtualForeignRef,
	avatarUrl: t,
	bio: t,
	commentDownvotes: t.VirtualForeignRef,
	commentUpvotes: t.VirtualForeignRef,
	email: t,
	name: t,
	posts: t.VirtualForeignRef,
	username: t
});
