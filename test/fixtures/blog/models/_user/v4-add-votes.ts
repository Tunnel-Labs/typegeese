// @ts-nocheck

import {
	PropType,
	Schema,
	VirtualForeignRef,
	createMigration,
	modelOptions,
	prop,
	virtualForeignRef
} from '~/index.js';

import * as UserV3 from './v3-add-bio.js';
import type * as $ from '../$schemas.js';

@modelOptions({ options: { disableLowerIndexes: true } })
export class User extends Schema(UserV3)<User> {
	get _v() {
		return 'v4-add-votes';
	}

	@prop(
		virtualForeignRef<User, $.CommentDownvote>(
			'User',
			'CommentDownvote',
			'user',
			'_id'
		),
		PropType.ARRAY
	)
	commentDownvotes!: VirtualForeignRef<User, $.CommentDownvote, 'user'>[];

	@prop(
		virtualForeignRef<User, $.CommentDownvote>(
			'User',
			'CommentDownvote',
			'user',
			'_id'
		),
		PropType.ARRAY
	)
	commentUpvotes!: VirtualForeignRef<User, $.CommentUpvote, 'user'>[];

	__migration__: typeof User_migration;
}

export const User_migration = createMigration<User>()
	.from(UserV3)
	.with(() => ({}))
	.migrate({});
