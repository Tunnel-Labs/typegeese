// @ts-nocheck

import {
	ForeignRef,
	PropType,
	VirtualForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	Schema,
	foreignRef,
	virtualForeignRef
} from '~/index.js';
import type * as $ from '../$schemas.js';

export class Post extends Schema('Post') {
	__type__!: Post;

	@prop({
		type: () => String,
		required: true
	})
	public title: string;

	@prop({
		type: () => String,
		required: true
	})
	public content: string;

	@prop(foreignRef<Post, $.User>('Post', 'User', 'posts', { required: true }))
	public author!: ForeignRef<Post, $.User, 'posts'>;

	@prop(
		virtualForeignRef<Post, $.Comment>('Post', 'Comment', 'post', '_id'),
		PropType.ARRAY
	)
	public comments!: VirtualForeignRef<Post, $.Comment, 'post'>[];
}

export const Post_migration = createMigration<Post>(null);

export const Post_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Post>({
		author: 'Cascade'
	});
