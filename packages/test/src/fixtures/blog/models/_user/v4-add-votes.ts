import {
	type Migrate,
	PropType,
	Schema,
	type VirtualForeignRef,
	modelOptions,
	prop,
	virtualForeignRef
} from 'typegeese';

import UserV3 from './v3-add-bio.js';

import type * as $ from '../$schemas.js';

@modelOptions({ options: { disableLowerIndexes: true } })
export default class User extends Schema(UserV3)<typeof User> {
	static _v = 'v4-add-votes';

	@prop(
		virtualForeignRef<User, $.CommentDownvote>(
			'User',
			'CommentDownvote',
			// @ts-ignore: renamed
			'user'
		),
		PropType.ARRAY
	)
	// @ts-ignore: renamed
	commentDownvotes!: VirtualForeignRef<User, $.CommentDownvote, 'user'>[];

	@prop(
		virtualForeignRef<User, $.CommentDownvote>(
			'User',
			'CommentDownvote',
			// @ts-ignore: renamed
			'user'
		),
		PropType.ARRAY
	)
	// @ts-ignore: renamed
	commentUpvotes!: VirtualForeignRef<User, $.CommentUpvote, 'user'>[];

	static _migration = (migrate: Migrate<UserV3, User>) => migrate({});
}
