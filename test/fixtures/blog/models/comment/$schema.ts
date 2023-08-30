export * from './v0.js';
import * as $ from './v0.js';

import type { t } from '~/index.js';
import type { User, Post } from '../$schemas.js';

export const { Comment } = $;
export type Comment = t.Shape<
	$.Comment,
	{
		_id: string;
		author: t.ForeignRef<User>;
		post: t.ForeignRef<Post>;
		text: string;
	}
>;
