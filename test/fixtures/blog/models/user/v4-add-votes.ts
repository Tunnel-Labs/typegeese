import {
	PropType,
	Schema,
	VirtualForeignRef,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';

import * as UserV3 from './v3-add-bio.js';
import { createMigration } from '~/utils/migration.js';
import { virtualForeignRef } from '~test/fixtures/blog/utils/refs.js';
import {
	CommentDownvote,
	CommentUpvote
} from '~test/fixtures/blog/models/$schemas.js';

export class User extends Schema(UserV3, 'v4-add-votes') {
	declare __self: User;

	@prop(virtualForeignRef('CommentDownvote', 'user', '_id'), PropType.ARRAY)
	public commentDownvotes!: VirtualForeignRef<User, CommentDownvote, 'user'>[];

	@prop(virtualForeignRef('CommentDownvote', 'user', '_id'), PropType.ARRAY)
	public commentUpvotes!: VirtualForeignRef<User, CommentUpvote, 'user'>[];
}

export const User_migration = createMigration<User>()
	.from(UserV3)
	.with(() => ({}))
	.migrate({});

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
