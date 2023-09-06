import type { t } from '~/index.js';
import type { Comment } from '../$schemas.js';

import * as $ from './v0.js';
export * from './v0.js';

type _CommentThread = t.Shape<
	$.CommentThread,
	{
		_id: string;
		comments: t.VirtualForeignRef<Comment>[];
	}
>;
