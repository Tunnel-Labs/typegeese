import {
	PropType,
	VirtualForeignRef,
	prop,
	index,
	Schema,
	virtualForeignRef
} from '~/index.js';

import type * as $ from '../$schemas.js';

@index({ email: 1 })
export class User extends Schema('User')<User> {
	get _v() {
		return 'v0' as const;
	}

	@prop({
		type: () => String,
		required: true
	})
	email!: string;

	@prop({
		type: () => String,
		required: false
	})
	name!: string;

	@prop(
		virtualForeignRef<User, $.Post>('User', 'Post', 'author', '_id'),
		PropType.ARRAY
	)
	posts!: VirtualForeignRef<User, $.Post, 'author'>[];

	@prop(
		virtualForeignRef<User, $.Comment>('User', 'Comment', 'author', '_id'),
		PropType.ARRAY
	)
	authoredComments!: VirtualForeignRef<User, $.Comment, 'author'>[];
}
