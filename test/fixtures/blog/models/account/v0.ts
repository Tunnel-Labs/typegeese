import { Schema } from '~/index.js';
import { User } from '../_user/$schema.js';

export class Account extends Schema('Account', { from: User })<Account> {
	get _v() {
		return 'v0' as const;
	}
}
