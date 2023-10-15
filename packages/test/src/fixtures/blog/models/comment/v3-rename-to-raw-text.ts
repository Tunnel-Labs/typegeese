import {
	type Migrate,
	Schema,
	getModelForSchema,
	prop,
	select,
} from 'typegeese';
import CommentV2 from './v2-add-votes.js';

export default class Comment extends Schema(CommentV2, {
	omit: { text: true }
})<typeof Comment> {
	static _v = 'v3-rename-to-raw-text';

	@prop({
		type: String,
		required: true
	})
	rawText!: string;

	static _migration: Migrate = async (
		migrate: Migrate<CommentV2, Comment>
	) => {
		const { _id, mongoose } = migrate;
		const CommentV2Model = getModelForSchema(CommentV2, { mongoose });
		const comment = await select(CommentV2Model.findById(_id), { text: true });
		if (comment === null) {
			return null;
		}

		return migrate({
			rawText: comment.text
		});
	};
}
