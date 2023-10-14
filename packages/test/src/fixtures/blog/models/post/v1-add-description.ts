import { Migrate, Schema, getModelForSchema, prop, select } from 'typegeese';
import PostV0 from './v0.js';

export default class Post extends Schema(PostV0)<typeof Post> {
	static _v = 'v1-add-description';

	@prop({ type: String, required: true })
	description!: string;

	static _migration = async (migrate: Migrate<PostV0, Post>) => {
		const { _id, mongoose } = migrate;
		const PostV0Model = getModelForSchema(PostV0, { mongoose });
		const post = await select(PostV0Model.findById(_id), { content: true });
		if (post === null) return null;
		return migrate({
			description: post.content.slice(0, 10) + '...'
		});
	};
}
