export * from './v0.js';
import * as $ from './v0.js';

import type { t } from '~/index.js';
import type { User, Comment } from '../$schemas.js';

export const { CommentDownvote } = $;
export type CommentDownvote = t.Shape<
	$.CommentDownvote,
	{
		_id: string;
		comment: t.ForeignRef<Comment>;
		user: t.ForeignRef<User>;
	}
>;
