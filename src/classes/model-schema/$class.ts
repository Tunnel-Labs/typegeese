import { prop } from '@typegoose/typegoose';
import { versionStringToVersionNumber } from '~/utils/version.js';

export interface ModelSchema {
	_id: string;
	_v: number;
}

export function ModelSchema<V extends string>(version: V) {
	const versionNumber = versionStringToVersionNumber(version);

	abstract class Schema {
		@prop({
			type: () => String,
			required: true
		})
		public _id!: string;

		@prop({
			type: () => Number,
			default: versionNumber,
			required: true
		})
		public _v!: V extends 'v0' ? 0 : number;

		/**
			This property is needed so that TypeScript can access the type of the schema
		*/
		abstract __self: any;
	}

	return Schema;
}
