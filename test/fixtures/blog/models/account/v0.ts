import { Schema, createMigration } from '~/index.js';
import { User } from '../_user/$schema.js';

export class Account extends Schema('Account', { from: User })<Account> {
	declare __type__: Account;
}

export const Account_migration = createMigration<Account>(null);
