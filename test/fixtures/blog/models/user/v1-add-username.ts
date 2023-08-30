import {
	Schema,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';

import * as UserV0 from './v0.js';
import { createMigration } from '~/utils/migration.js';
import { getMongoose } from '~test/utils/mongoose.js';

export class User extends Schema(UserV0, 'v1-add-username') {
	declare __self: User;

	@prop({
		type: () => String,
		required: true
	})
	public username!: string;
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
