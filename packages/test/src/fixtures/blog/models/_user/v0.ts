import {
	PropType,
	type VirtualForeignRef,
	prop,
	index,
	Schema,
	virtualForeignRef
} from 'typegeese';

import type * as $ from '../$schemas.js';

@index({ email: 1 })
export default class User extends Schema('User')<typeof User> {
	static _v = 0;

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
		virtualForeignRef<User, $.Post>('User', 'Post', 'author'),
		PropType.ARRAY
	)
	posts!: VirtualForeignRef<User, $.Post, 'author'>[];

	@prop(
		virtualForeignRef<User, $.Comment>('User', 'Comment', 'author'),
		PropType.ARRAY
	)
	authoredComments!: VirtualForeignRef<User, $.Comment, 'author'>[];
}
