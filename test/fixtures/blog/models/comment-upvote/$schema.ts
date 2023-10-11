import { defineRelations, type t } from '~/index.js';
import type * as $ from '../$schemas.js';

export * from './v1-rename-account-to-user.js';

type _CommentUpvote = t.Shape<
	$.CommentUpvote,
	{
		_id: string;
		comment: t.ForeignRef<$.Comment>;
		account: t.ForeignRef<$.Account>;
	},
	typeof CommentUpvote_onForeignModelDeletedActions
>;

export const CommentUpvote_onForeignModelDeletedActions =
	defineRelations<$.CommentUpvote>({
		account: 'Cascade',
		comment: 'Cascade'
	});
