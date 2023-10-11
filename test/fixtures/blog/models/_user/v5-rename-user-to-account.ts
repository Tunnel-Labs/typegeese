import { Schema } from '~/index.js';

import * as UserV4 from './v4-add-votes.js';

export class User extends Schema(UserV4)<User> {
	get _v() {
		return 'v5-rename-user-to-account';
	}
}
