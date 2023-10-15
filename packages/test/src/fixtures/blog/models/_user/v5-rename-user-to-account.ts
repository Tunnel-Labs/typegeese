import { Migrate, Schema } from 'typegeese';

import UserV4 from './v4-add-votes.js';

export default class User extends Schema(UserV4)<typeof User> {
	static _v = 'v5-rename-user-to-account';

	static _migration: Migrate = (migrate: Migrate<UserV4, User>) => migrate({});
}
