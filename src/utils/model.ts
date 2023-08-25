import { prop } from '@typegoose/typegoose';

export function ModelSchema<V extends string>(version: V) {
	class Schema {
		@prop({
			type: () => String,
			required: true
		})
		public _id!: string;

		@prop({
			type: () => String,
			default: version,
			required: true
		})
		public _version!: V;
	}

	return Schema;
}
