import {
	IsSupersetKey,
	MigrationFunctions,
	ModelSchema,
	NonSupersetKeys,
	NormalizedHyperschema,
	PropType,
	VirtualForeignRef,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';

import { virtualForeignRef } from '../../utils/refs.js';
import type { Post, Comment } from '../$schemas.js';
import * as UserV0 from './v0.js';
import { getModels } from '~test/fixtures/blog/models/$models.js';
import { createMigration } from '~/utils/migration.js';

export class User extends ModelSchema('v1-add-username') {
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

	@prop({
		type: () => String,
		required: true
	})
	public username!: string;

	@prop(virtualForeignRef('Post', 'author', '_id'), PropType.ARRAY)
	public posts!: VirtualForeignRef<User, Post, 'author'>[];

	@prop(virtualForeignRef('Comment', 'author', '_id'), PropType.ARRAY)
	public authoredComments!: VirtualForeignRef<User, Comment, 'author'>[];
}

export const User_migration = createMigration<User>()
	.from(UserV0)
	.with(async ({ _id }) => {
		const { UserModel } = await getModels();
		const user = await UserModel.findById(_id, { email: 1 }).lean().exec();
		return user as unknown as { email: string };
	})
	.migrate({
		async username() {
			return this.email.split('@')[0] ?? 'user';
		}
	});

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
