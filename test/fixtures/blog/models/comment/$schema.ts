import type { t } from '~/index.js';
import type {
	User,
	Post,
	CommentDownvote,
	CommentUpvote,
	Comment
} from '../$schemas.js';

import type * as $ from './v2-add-votes.js';
export * from './v2-add-votes.js';

type _Comment = t.Shape<
	$.Comment,
	{
		_id: string;
		author: t.ForeignRef<User>;
		post: t.ForeignRef<Post>;
		text: string;
		parentComment: t.ForeignRef<Comment> | null;
		replies: t.VirtualForeignRef<Comment>[];
		upvotes: t.VirtualForeignRef<CommentUpvote>[];
		downvotes: t.VirtualForeignRef<CommentDownvote>[];
	}
>;
