import { defineRelations, type t } from '~/index.js';
import type * as $ from '../$schemas.js';

export * from './v0.js';

type _Account = t.Shape<
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
	},
	typeof Account_relations
>;

export const Account_relations = defineRelations<$.Account>({});
