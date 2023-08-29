import { QueryWithHelpers } from 'mongoose';
import { ArrayInnerValue } from '~/types/array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__self'];
