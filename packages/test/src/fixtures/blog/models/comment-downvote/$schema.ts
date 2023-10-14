export { default as CommentDownvote } from './v1-rename-account-to-user.js';

import { t } from '@typegeese/shape';
import type * as $ from '../$schemas.js';

export type $CommentDownvote = t.Shape<
	$.CommentDownvote,
	{
		_id: string;
		comment: t.ForeignRef<$.Comment>;
		account: t.ForeignRef<$.Account>;
	}
>;
