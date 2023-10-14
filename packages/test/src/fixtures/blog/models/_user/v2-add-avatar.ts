import { Migrate, Schema, prop } from 'typegeese';

import UserV1 from './v1-add-username.js';

export default class User extends Schema(UserV1)<typeof User> {
	static _v = 'v2-add-avatar';

	@prop({ type: String, required: true })
	avatarUrl!: string;

	static _migration = async (migrate: Migrate<UserV1, User>) => {
		const { _id } = migrate;
		return migrate({
			avatarUrl: `https://www.gravatar.com/avatar/${_id}?s=32&d=identicon&r=PG`
		});
	};
}
