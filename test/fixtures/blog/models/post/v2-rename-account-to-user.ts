import {
	ForeignRef,
	Schema,
	createMigration,
	foreignRef,
	prop
} from '~/index.js';
import * as PostV1 from './v1-add-description.js';
import type * as $ from '../$schemas.js';

export class Post extends Schema(PostV1, { omit: { author: true } })<Post> {
	get _v() {
		return 'v2-rename-account-to-user';
	}

	@prop(
		foreignRef<Post, $.Account>('Post', 'Account', 'posts', { required: true })
	)
	author!: ForeignRef<Post, $.Account, 'posts'>;

	__migration__: typeof Post_migration;
}

export const Post_migration = createMigration<Post>()
	.from(PostV1)
	.with(null)
	.migrate({});
