import { QueryWithHelpers } from 'mongoose';
import { Class } from 'type-fest';
import { ArrayInnerValue } from '~/types/array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export type BaseSchema = Class<{
	_id: string;
	_v: number;
	__name__?: string;
}> & { _v: number };

export interface NewSchemaOptions {
	from?: new () => BaseSchema;
}
