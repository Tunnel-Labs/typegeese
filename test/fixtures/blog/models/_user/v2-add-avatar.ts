import {
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	prop,
	select
} from '~/index.js';

import * as UserV1 from './v1-add-username.js';

export class User extends Schema(UserV1)<User> {
	get _v() {
		return 'v2-add-avatar';
	}

	@prop({ type: () => String, required: true })
	avatarUrl!: string;
}

export const User_migration = createMigration<User>()
	.from(UserV1)
	.with(async function ({ _id }) {
		const UserV1Model = getModelForHyperschema(UserV1, {
			mongoose: this.mongoose
		});
		const user = await select(UserV1Model.findById(_id), { _id: true });
		return user;
	})
	.migrate({
		avatarUrl() {
			return `https://www.gravatar.com/avatar/${this._id}?s=32&d=identicon&r=PG`;
		}
	});
