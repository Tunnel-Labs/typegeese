import { QueryWithHelpers } from 'mongoose';
import { Class } from 'type-fest';
import { ArrayInnerValue } from '~/types/array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export type BaseSchemaInstance = {
	_id: string;
	_v: string;
	__name__?: string;
};

export type BaseSchemaClass = Class<BaseSchemaInstance> & { _v: string };

export interface NewSchemaOptions {
	from?: new () => BaseSchemaInstance;
}
