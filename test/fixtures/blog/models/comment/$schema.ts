import type { t } from '~/index.js';
import type * as $ from '../$schemas.js';

export * from './v4-rename-user-to-account.js';

type _Comment = t.Shape<
	$.Comment,
	{
		_id: string;
		author: t.ForeignRef<$.Account>;
		post: t.ForeignRef<$.Post>;
		rawText: string;
		parentComment: t.ForeignRef<$.Comment> | null;
		replies: t.VirtualForeignRef<$.Comment>[];
		upvotes: t.VirtualForeignRef<$.CommentUpvote>[];
		downvotes: t.VirtualForeignRef<$.CommentDownvote>[];
	}
>;
