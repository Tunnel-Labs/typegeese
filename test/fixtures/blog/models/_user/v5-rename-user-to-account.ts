import { Schema } from '~/index.js';

import * as UserV4 from './v4-add-votes.js';

export class _User extends Schema(UserV4, 'v5-rename-to-account') {}
