import { t } from '@typegeese/shape';

import type { $Post } from './$schema.js';

export const Post = t.Shape<$Post>({
	_id: t,
	author: t.ForeignRef,
	title: t,
	comments: t.VirtualForeignRef,
	content: t,
	description: t
});
