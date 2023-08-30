export * from './v0.js';
import * as $ from './v0.js';
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
	}
>;
