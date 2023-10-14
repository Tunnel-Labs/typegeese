import {
	type Migrate,
	Schema,
	getModelForSchema,
	index,
	prop,
	select
} from 'typegeese';

import UserV0 from './v0.js';

@index({ username: 1 }, { unique: true })
export default class User extends Schema(UserV0)<typeof User> {
	static _v = 'v1-add-username';

	@prop({ type: () => String, required: true })
	username!: string;

	static _migration = async (migrate: Migrate<UserV0, User>) => {
		const { _id, mongoose } = migrate;
		const UserV0Model = getModelForSchema(UserV0, { mongoose });
		const user = await select(UserV0Model.findById(_id), { email: true });
		if (user === null) return null;
		return migrate({
			username: user.email.split('@')[0] ?? 'user'
		});
	};
}
