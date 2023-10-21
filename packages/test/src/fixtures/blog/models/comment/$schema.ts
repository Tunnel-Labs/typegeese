export { default as Comment } from './v4-rename-user-to-account.js';

import { t } from '@typegeese/shape';
import type * as $ from '../$schemas.js';

export type CommentShape = t.Shape<
	$.Comment,
	{
		_id: string;
		author: t.ForeignRef<$.Account>;
		parentComment: t.ForeignRef<$.Comment> | null;
		post: t.ForeignRef<$.Post>;
		rawText: string;
		replies: t.VirtualForeignRef<$.Comment>[];
		upvotes: t.VirtualForeignRef<$.CommentUpvote>[];
		downvotes: t.VirtualForeignRef<$.CommentDownvote>[];
	}
>;
