import type { t } from '~/index.js';
import type {
	CommentUpvote,
	CommentDownvote,
	Comment,
	Post
} from '../$schemas.js';

import * as $ from './v4-add-votes.js';
export * from './v4-add-votes.js';

type _User = t.Shape<
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
