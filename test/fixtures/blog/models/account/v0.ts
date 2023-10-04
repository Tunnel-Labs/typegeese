import { Schema, createMigration } from '~/index.js';
import { _User } from '../_user/$schema.js';

export class Account extends Schema('Account', { from: _User }) {
	declare __type__: Account;
}

export const Account_migration = createMigration<Account>(null);
