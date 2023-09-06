import type { t } from '~/index.js';
import type { CommentThread } from '../$schemas.js';

import * as $ from './v0.js';
export * from './v0.js';

type _Comment = t.Shape<
	$.Comment,
	{
		_id: string;
		parentCommentThread: t.ForeignRef<CommentThread>;
		rawText: string;
	}
>;
