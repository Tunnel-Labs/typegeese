import {
	PropType,
	VirtualForeignRef,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop,
	BaseSchema,
	index
} from '~/index.js';

import { virtualForeignRef } from '../../utils/refs.js';
import type { Comment, Post } from '../$schemas.js';

@index({ email: 1 })
export class User extends BaseSchema {
	declare __type: User;

	@prop({
		type: () => String,
		required: true
	})
	public email!: string;

	@prop({
		type: () => String,
		required: false
	})
	public name!: string;

	@prop(virtualForeignRef('User', 'Post', 'author', '_id'), PropType.ARRAY)
	public posts!: VirtualForeignRef<User, Post, 'author'>[];

	@prop(virtualForeignRef('User', 'Comment', 'author', '_id'), PropType.ARRAY)
	public authoredComments!: VirtualForeignRef<User, Comment, 'author'>[];
}

export const User_migration = createMigration<User>(null);

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
