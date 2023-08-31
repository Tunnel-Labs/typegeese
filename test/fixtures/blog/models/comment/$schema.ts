export * from './v2-add-votes.js';
import * as $ from './v2-add-votes.js';

import type { t } from '~/index.js';
import type {
	User,
	Post,
	CommentDownvote,
	CommentUpvote
} from '../$schemas.js';

export const { Comment } = $;
export type Comment = t.Shape<
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
