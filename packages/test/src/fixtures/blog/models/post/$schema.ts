export { default as Post } from './v2-rename-account-to-user.js';

import { t } from '@typegeese/shape';
import type * as $ from '../$schemas.js';

export type $Post = t.Shape<
	$.Post,
	{
		_id: string;
		author: t.ForeignRef<$.Account>;
		title: string;
		comments: t.VirtualForeignRef<$.Comment>[];
		content: string;
		description: string;
	}
>;
