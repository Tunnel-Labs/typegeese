import type { QueryWithHelpers } from 'mongoose';

export type IsManyQuery<Query extends QueryWithHelpers<any, any>> =
	Awaited<ReturnType<Query['exec']>> extends Array<any> ?
		true :
		false;
