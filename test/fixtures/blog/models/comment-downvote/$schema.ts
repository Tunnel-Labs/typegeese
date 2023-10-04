import type { t } from '~/index.js';
import type * as $ from '../$schemas.js';

export * from './v1-rename-account-to-user.js';

type _CommentDownvote = t.Shape<
	$.CommentDownvote,
	{
		_id: string;
		comment: t.ForeignRef<$.Comment>;
		account: t.ForeignRef<$.Account>;
	}
>;
