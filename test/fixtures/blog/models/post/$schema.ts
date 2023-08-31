export * from './v1-add-description.js';
import * as $ from './v1-add-description.js';

import type { t } from '~/index.js';
import type { User, Comment } from '../$schemas.js';

export const { Post } = $;
export type Post = t.Shape<
	$.Post,
	{
		_id: string;
		author: t.ForeignRef<User>;
		title: string;
		comments: t.VirtualForeignRef<Comment>[];
		content: string;
		description: string;
	}
>;
