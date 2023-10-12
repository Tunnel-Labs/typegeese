import { Schema, createMigration } from '~/index.js';

import * as UserV4 from './v4-add-votes.js';

export class User extends Schema(UserV4)<typeof User> {
	static _v = 'v5-rename-user-to-account';

	static migration: typeof User_migration;
}

export const User_migration = createMigration<User>()
	.from(UserV4)
	.with(() => ({}))
	.migrate({});
