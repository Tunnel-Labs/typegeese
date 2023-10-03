import { QueryWithHelpers } from 'mongoose';
import { ArrayInnerValue } from '~/types/array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export type AnySchema = {
	_id: string;
	_v: number;
	__name__?: string;
};

export interface NewSchemaOptions {
	from?: AnySchema;
}
