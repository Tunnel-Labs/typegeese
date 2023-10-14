import { Migrate, Schema, prop } from 'typegeese';

import UserV2 from './v2-add-avatar.js';

export default class User extends Schema(UserV2)<typeof User> {
	static _v = 'v3-add-bio';

	@prop({ type: String, required: false })
	bio!: string | null;

	static _migration = (migrate: Migrate<UserV2, User>) =>
		migrate({ bio: null });
}
