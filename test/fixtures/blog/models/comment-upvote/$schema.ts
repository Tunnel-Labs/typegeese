export * from './v1-rename-account-to-user.js';

import { defineRelations, type t } from '~/index.js';
import type * as $ from '../$schemas.js';

type _CommentUpvote = t.Shape<
	$.CommentUpvote,
	{
		_id: string;
		comment: t.ForeignRef<$.Comment>;
		account: t.ForeignRef<$.Account>;
	},
	typeof CommentUpvote_relations
>;

export const CommentUpvote_relations =
	defineRelations<$.CommentUpvote>({
		account: 'Cascade',
		comment: 'Cascade'
	});
