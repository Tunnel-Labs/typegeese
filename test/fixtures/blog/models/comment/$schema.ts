export * from './v0.js';

import type { t } from '~/index.js';
import type { User, Comment, Post } from '../$schemas.js';

type _ = t.Shape<
	Comment,
	{
		_id: string;
		author: t.ForeignRef<User>;
		post: t.ForeignRef<Post>;
		text: string;
	}
>;
