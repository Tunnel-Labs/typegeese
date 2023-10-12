import {
	Schema,
	createMigration,
	getModelForHyperschema,
	index,
	prop,
	select
} from '~/index.js';

import * as UserV0 from './v0.js';

@index({ username: 1 }, { unique: true })
export class User extends Schema(UserV0)<typeof User> {
	static _v = 'v1-add-username';

	@prop({ type: () => String, required: true })
	username!: string;

	static migration: typeof User_migration;
}

export const User_migration = createMigration<User>()
	.from(UserV0)
	.with(async function ({ _id }) {
		const UserV0Model = getModelForHyperschema(UserV0, {
			mongoose: this.mongoose
		});
		const user = await select(UserV0Model.findById(_id), { email: true });
		return user;
	})
	.migrate({
		async username() {
			return this.email.split('@')[0] ?? 'user';
		}
	});
