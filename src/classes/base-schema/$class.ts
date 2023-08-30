import { prop } from '@typegoose/typegoose';

export class BaseSchema {
	@prop({
		type: () => String,
		required: true
	})
	public _id!: string;

	@prop({
		type: () => Number,
		default: 0,
		required: true
	})
	public _v!: 0;
}
