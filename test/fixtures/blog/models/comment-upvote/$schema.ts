import type { t } from '~/index.js';
import type { User, Comment } from '../$schemas.js';

import * as $ from './v0.js';
export * from './v0.js';

type _CommentUpvote = t.Shape<
	$.CommentUpvote,
	{
		_id: string;
		comment: t.ForeignRef<Comment>;
		user: t.ForeignRef<User>;
	}
>;
