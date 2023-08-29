import {
	ForeignRef,
	ModelSchema,
	PropType,
	VirtualForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';
import type { Comment, User } from '../$schemas.js';
import { foreignRef, virtualForeignRef } from '../../utils/refs.js';

export class Post extends ModelSchema('v0') {
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

	@prop(foreignRef('User', 'posts', { required: true }))
	public author!: ForeignRef<Post, User, 'posts'>;

	@prop(virtualForeignRef('Comment', 'post', '_id'), PropType.ARRAY)
	public comments!: VirtualForeignRef<Post, Comment, 'post'>[];
}

export const Post_migration = createMigration<Post>(null);

export const Post_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<Post>({
		author: 'Cascade'
	});
