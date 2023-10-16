import * as mongoose from 'mongoose';
import type { QueryWithHelpers } from 'mongoose';
import type {
	Class,
	EmptyObject,
	Exact,
	IsNever,
	RequiredKeysOf
} from 'type-fest';
import type { AnyMigrationFunction } from './migration.js';
import type { ArrayInnerValue } from './array.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export interface AnySchemaInstance {
	// _id: string;
}

export type AnyMigrationSchemaClass = Class<AnySchemaInstance> & {
	_v: number | string;
	_migration?: AnyMigrationFunction;
	_initialize?: ({
		mongoose,
		meta
	}: {
		mongoose: mongoose.Mongoose;
		meta: any;
	}) => void | Promise<void>;
};

export type AnyModelSchemaClass = Class<AnySchemaInstance> & {
	_v: number | string;
	_initialize?: ({
		mongoose,
		meta
	}: {
		mongoose: mongoose.Mongoose;
		meta: any;
	}) => void | Promise<void>;
};

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
	new <T extends { _v: number; new (): any }>():
		(
			Options['from'] extends new () => infer Schema ?
				Omit<Schema, '_v' | '__type__' | '__name__'> :
			{}
		) & {
			__type__?: InstanceType<T>;
			__name__?: SchemaName;
			_id: string;
		}
}

export interface MigrationSchemaExtends<
	PreviousSchema extends AnyMigrationSchemaClass,
	Options extends {
		omit: {
			[K in keyof InstanceType<PreviousSchema>]?: true;
		};
	}
> {
	// prettier-ignore
	new <T extends {
		_v: string;
		new (): any
		_migration(args: any): any
	}>(): Omit<
		InstanceType<PreviousSchema>,
		| '_v'
		| '_migration'
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
