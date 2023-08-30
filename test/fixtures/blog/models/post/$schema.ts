export * from './v0.js';

import type { t } from '~/index.js';
import { User, Comment, Post } from '../$schemas.js';

type _ = t.Shape<
	Post,
	{
		_id: string;
		author: t.ForeignRef<User>;
		title: string;
		comments: t.VirtualForeignRef<Comment>[];
		content: string;
	}
>;
