import { t } from '@typegeese/shape';

import type { $Post } from './$schema.js';

export const Post = t.Shape<$Post>({
	_id: t,
	author: t.ForeignRef('Account'),
	title: t,
	comments: t.VirtualForeignRef('Comment'),
	content: t,
	description: t
});
