import {
	type ForeignRef,
	type Migrate,
	Schema,
	foreignRef,
	prop
} from 'typegeese';
import CommentV3 from './v3-rename-to-raw-text.js';
import type * as $ from '../$schemas.js';

export default class Comment extends Schema(CommentV3, {
	omit: { author: true }
})<typeof Comment> {
	static _v = 'v4-rename-user-to-account';

	@prop(
		foreignRef<Comment, $.Account>('Comment', 'Account', 'authoredComments', {
			required: true,
			onDelete: 'Cascade'
		})
	)
	author!: ForeignRef<Comment, $.Account, 'authoredComments'>;

	static _migration: Migrate = (migrate: Migrate<Comment, CommentV3>) =>
		migrate({});
}
