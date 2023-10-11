export * from './v1-rename-account-to-user.js';

import { defineRelations, type t } from '~/index.js';
import type * as $ from '../$schemas.js';

type _CommentDownvote = t.Shape<
	$.CommentDownvote,
	{
		_id: string;
		comment: t.ForeignRef<$.Comment>;
		account: t.ForeignRef<$.Account>;
	},
	typeof CommentDownvote_relations
>;

export const CommentDownvote_relations =
	defineRelations<$.CommentDownvote>({
		account: 'Cascade',
		comment: 'Cascade'
	});
