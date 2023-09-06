export * from './v0.js';
import * as $ from './v0.js';

import type { t } from '~/index.js';
import type { CommentThread } from '../$schemas.js';

export const { Comment } = $;
export type Comment = t.Shape<
	$.Comment,
	{
		_id: string;
		parentCommentThread: t.ForeignRef<CommentThread>;
		rawText: string;
	}
>;
