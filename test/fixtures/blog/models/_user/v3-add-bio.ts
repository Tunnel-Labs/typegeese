import { Schema, createMigration, prop } from '~/index.js';

import * as UserV2 from './v2-add-avatar.js';

export class User extends Schema(UserV2)<typeof User> {
	static _v = 'v3-add-bio';

	@prop({ type: String, required: false })
	bio!: string | null;

	static migration: typeof User_migration;
}

export const User_migration = createMigration<User>()
	.from(UserV2)
	.with(() => ({}))
	.migrate({
		bio() {
			return null;
		}
	});
