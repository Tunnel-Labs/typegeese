import {
	type ForeignRef,
	PropType,
	type VirtualForeignRef,
	prop,
	Schema,
	foreignRef,
	virtualForeignRef
} from 'typegeese';
import type * as $ from '../$schemas.js';

export default class Post extends Schema('Post')<typeof Post> {
	static _v = 0;

	@prop({ type: String, required: true })
	title: string;

	@prop({ type: String, required: true })
	content: string;

	@prop(
		foreignRef<
			Post,
			// @ts-ignore: renamed
			$.User
		>('Post', 'User', 'posts', { required: true, onDelete: 'Cascade' })
	)
	author!: ForeignRef<
		Post,
		// @ts-ignore: renamed
		$.User,
		'posts'
	>;

	@prop(
		virtualForeignRef<Post, $.Comment>('Post', 'Comment', 'post'),
		PropType.ARRAY
	)
	comments!: VirtualForeignRef<Post, $.Comment, 'post'>[];
}
