import type { t } from '~/index.js';
import type * as $ from '../$schemas.js';

export * from './v2-rename-account-to-user.js';

type _Post = t.Shape<
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
