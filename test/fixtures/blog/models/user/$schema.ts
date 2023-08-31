export * from './v4-add-votes.js';
import * as $ from './v4-add-votes.js';

import type { t } from '~/index.js';
import type {
	CommentUpvote,
	CommentDownvote,
	Comment,
	Post
} from '../$schemas.js';

export const { User } = $;
export type User = t.Shape<
	$.User,
	{
		_id: string;
		name: string;
		email: string;
		username: string;
		posts: t.VirtualForeignRef<Post>[];
		authoredComments: t.VirtualForeignRef<Comment>[];
		avatarUrl: string;
		bio: string;
		commentDownvotes: t.VirtualForeignRef<CommentDownvote>[];
		commentUpvotes: t.VirtualForeignRef<CommentUpvote>[];
	}
>;
