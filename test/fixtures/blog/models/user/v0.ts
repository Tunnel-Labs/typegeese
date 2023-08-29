import {
	ModelSchema,
	PropType,
	VirtualForeignRef,
	defineMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';

import { virtualForeignRef } from '../../utils/refs.js';
import type { Comment, Post } from '../$schemas.js';

export class UserV0 extends ModelSchema('v0') {
	@prop({
		type: () => String,
		required: true
	})
	public email!: string;

	@prop({
		type: () => String,
		required: false
	})
	public name?: string;

	@prop(virtualForeignRef('Post', 'author', '_id'), PropType.ARRAY)
	public posts!: VirtualForeignRef<UserV0, Post, 'author'>[];

	@prop(virtualForeignRef('Comment', 'author', '_id'), PropType.ARRAY)
	public authoredComments!: VirtualForeignRef<UserV0, Comment, 'author'>[];
}

export const User_migration = defineMigration<null, UserV0>(null);

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<UserV0>({});
