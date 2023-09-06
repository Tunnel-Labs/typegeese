export * from './v0.js';
import * as $ from './v0.js';

import type { t } from '~/index.js';
import type { Comment } from '../$schemas.js';

export const { CommentThread } = $;
export type CommentThread = t.Shape<
	$.CommentThread,
	{
		_id: string;
		comments: t.VirtualForeignRef<Comment>[];
	}
>;
