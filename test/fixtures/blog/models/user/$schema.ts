export * from './v1-add-username.js';

import type { t } from '~/index.js';
import { User, Comment, Post } from '../$schemas.js';

type _ = t.Shape<
	User,
	{
		_id: string;
		name: string;
		email: string;
		username: string;
		posts: t.VirtualForeignRef<Post>[];
		authoredComments: t.VirtualForeignRef<Comment>[];
	}
>;
