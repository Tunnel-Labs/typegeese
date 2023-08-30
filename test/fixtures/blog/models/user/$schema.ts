export * from './v1-add-username.js';
import * as $ from './v1-add-username.js';
import type { t } from '~/index.js';
import type { Comment, Post } from '../$schemas.js';

export const { User } = $;
export type User = t.Shape<
	$.User,
	{
		_id: string;
		name: string;
		email: string;
		username: string;
		posts: t.VirtualForeignRef<Post>[];
		authoredComments: t.VirtualForeignRef<Comment>[];
	}
>;

export * from './v1-add-username.js';
