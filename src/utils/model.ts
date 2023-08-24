import { prop } from '@typegoose/typegoose';

export function ModelSchema(version: string) {
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
		public _version!: string;
	}

	return Schema;
}
