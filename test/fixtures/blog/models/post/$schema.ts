export * from './v2-rename-account-to-user.js';

import { defineRelations, type t } from '~/index.js';
import type * as $ from '../$schemas.js';

type _Post = t.Shape<
	$.Post,
	{
		_id: string;
		author: t.ForeignRef<$.Account>;
		title: string;
		comments: t.VirtualForeignRef<$.Comment>[];
		content: string;
		description: string;
	},
	typeof Post_relations
>;

export const Post_relations = defineRelations<$.Post>({
	author: 'Cascade'
});
