import {
	ModelSchema,
	PropType,
	VirtualForeignRef,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';

import { virtualForeignRef } from '../../utils/refs.js';
import type { Post, Comment } from '../$schemas.js';
import * as UserV0 from './v0.js';
import { createMigration } from '~/utils/migration.js';
import { getMongoose } from '~test/utils/mongoose.js';

export class User extends ModelSchema('v1-add-username') {
	__self!: User;

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
		const UserV0Model = getModelForHyperschema(UserV0, {
			mongoose: await getMongoose()
		});

		const user = await select(UserV0Model.findById(_id), { email: true });

		if (user === null) throw new Error(`User "${_id}" not found.`);

		return user;
	})
	.migrate({
		async username() {
			return this.email.split('@')[0] ?? 'user';
		}
	});

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
