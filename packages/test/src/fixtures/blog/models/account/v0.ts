import { Schema } from 'typegeese';
import { User } from '../_user/$schema.js';

export default class Account extends Schema('Account', { from: User })<
	typeof Account
> {
	static _v = 0;
}
