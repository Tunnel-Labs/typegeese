import type { QueryWithHelpers } from 'mongoose';
import type { Class, RequiredKeysOf } from 'type-fest';
import type { MigrateReturn } from './migration.js';
import type { ArrayInnerValue } from './array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export interface AnySchemaInstance {
	// _id: string;
}

export type AnySchemaClass = Class<AnySchemaInstance> & { _v: number | string };

export type BaseSchemaInstance = {
	_id: string;
	__name__?: string;
};

export type BaseSchemaClass = Class<BaseSchemaInstance> & { _v: string };

export interface NewSchemaOptions {
	from?: new () => BaseSchemaInstance;
}

// prettier-ignore
export interface BaseSchemaExtends<
	SchemaName extends string,
	Options extends NewSchemaOptions
> {
	new <T extends { _v: number; new (): any,}>():
		(
			Options['from'] extends new () => infer Schema ?
				Omit<Schema, '_v' | '__type__' | '__name__'> :
			{}
		) & {
			__type__?: InstanceType<T>;
			__name__?: SchemaName;
			_id: string;
		};
}

export interface MigrationSchemaExtends<
	PreviousSchema extends AnySchemaClass,
	Options extends {
		omit: {
			[K in keyof PreviousSchema]?: true;
		};
	}
> {
	// prettier-ignore
	new <T extends {
		_v: string;
		_migration(migrate: any): MigrateReturn<any, any>
		new (): any
	}>(): Omit<
		InstanceType<PreviousSchema>,
		| '_v'
		| '_migrate'
		| '__type__'
		| (
				Options extends Record<string, any> ?
					RequiredKeysOf<Options['omit']> :
				never
			)
	> & {
		__type__?: InstanceType<T>;
		_id: string;
	};
}
