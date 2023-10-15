import {
	type ForeignRef,
	type Migrate,
	Schema,
	foreignRef,
	prop
} from 'typegeese';
import PostV1 from './v1-add-description.js';

import type * as $ from '../$schemas.js';

export default class Post extends Schema(PostV1, { omit: { author: true } })<
	typeof Post
> {
	static _v = 'v2-rename-account-to-user';

	@prop(
		foreignRef<Post, $.Account>('Post', 'Account', 'posts', {
			required: true,
			onDelete: 'Cascade'
		})
	)
	author!: ForeignRef<Post, $.Account, 'posts'>;

	static _migration: Migrate = async (migrate: Migrate<PostV1, Post>) =>
		migrate({});
}
