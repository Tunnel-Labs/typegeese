import {
	ForeignRef,
	PropType,
	VirtualForeignRef,
	prop,
	Schema,
	foreignRef,
	virtualForeignRef
} from '~/index.js';
import type * as $ from '../$schemas.js';

export class Post extends Schema('Post')<Post> {
	@prop({
		type: () => String,
		required: true
	})
	title: string;

	@prop({
		type: () => String,
		required: true
	})
	content: string;

	@prop(foreignRef<Post, $.User>('Post', 'User', 'posts', { required: true }))
	author!: ForeignRef<Post, $.User, 'posts'>;

	@prop(
		virtualForeignRef<Post, $.Comment>('Post', 'Comment', 'post', '_id'),
		PropType.ARRAY
	)
	comments!: VirtualForeignRef<Post, $.Comment, 'post'>[];
}
