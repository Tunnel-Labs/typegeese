import { QueryWithHelpers } from 'mongoose';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<Awaited<ReturnType<Query['exec']>>>['prototype'];
