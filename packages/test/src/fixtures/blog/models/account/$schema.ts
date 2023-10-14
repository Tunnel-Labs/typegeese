export { default as Account } from './v0.js';

import { t } from '@typegeese/shape';
import type * as $ from '../$schemas.js';

export type $Account = t.Shape<
	$.Account,
	{
		_id: string;
		name: string;
		email: string;
		username: string;
		posts: t.VirtualForeignRef<$.Post>[];
		authoredComments: t.VirtualForeignRef<$.Comment>[];
		avatarUrl: string;
		bio: string;
		commentDownvotes: t.VirtualForeignRef<$.CommentDownvote>[];
		commentUpvotes: t.VirtualForeignRef<$.CommentUpvote>[];
	}
>;
