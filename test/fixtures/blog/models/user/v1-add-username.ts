import {
	Schema,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	index,
	prop,
	select
} from '~/index.js';

import * as UserV0 from './v0.js';
import { createMigration } from '~/utils/migration.js';

@index({ username: 1 }, { unique: true })
export class User extends Schema(UserV0, 'v1-add-username') {
	declare __type: User;

	@prop({ type: () => String, required: true })
	public username!: string;
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

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
