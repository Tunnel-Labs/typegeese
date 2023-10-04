import {
	ForeignRef,
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	foreignRef,
	prop
} from '~/index.js';
import * as PostV1 from './v1-add-description.js';
import type * as $ from '../$schemas.js';

export class Post extends Schema(PostV1, 'v2-rename-account-to-user') {
	__type__!: Post;

	@prop(
		foreignRef<Post, $.Account>('Post', 'Account', 'posts', { required: true })
	)
	public author!: ForeignRef<Post, $.Account, 'posts'>;
}

export const Post_migration = createMigration<Post>()
	.from(PostV1)
	.with(null)
	.migrate({});

export const Post_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Post>({
		author: 'Cascade'
	});
