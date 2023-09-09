import {
	Schema,
	defineOnForeignModelDeletedActions,
	getModelForHyperschema,
	modelOptions,
	prop,
	select
} from '~/index.js';

import * as UserV1 from './v1-add-username.js';
import { createMigration } from '~/utils/migration.js';

export class User extends Schema(UserV1, 'v2-add-avatar') {
	declare __type: User;

	@prop({ type: () => String, required: true })
	public avatarUrl!: string;
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

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});
