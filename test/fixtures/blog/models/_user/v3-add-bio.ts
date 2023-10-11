import {
	Schema,
	createMigration,
	defineOnForeignModelDeletedActions,
	prop
} from '~/index.js';

import * as UserV2 from './v2-add-avatar.js';

export class User extends Schema(UserV2, 'v3-add-bio') {
	declare __type__: User;

	@prop({ type: () => String, required: false })
	bio!: string | null;
}

export const User_migration = createMigration<User>()
	.from(UserV2)
	.with(() => ({}))
	.migrate({
		bio() {
			return null;
		}
	});

export const User_onForeignModelDeletedActions =
	defineOnForeignModelDeletedActions<User>({});