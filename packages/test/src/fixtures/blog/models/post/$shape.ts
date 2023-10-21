import { t } from '@typegeese/shape';

import type { PostShape } from './$schema.js';

export const Post = t.Shape<PostShape>({
	_id: t,
	author: t.ForeignRef('Account'),
	title: t,
	comments: t.VirtualForeignRef('Comment'),
	content: t,
	description: t
});
