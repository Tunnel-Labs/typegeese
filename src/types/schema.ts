import type { QueryWithHelpers } from 'mongoose';
import type { Class, RequiredKeysOf } from 'type-fest';
import type { ArrayInnerValue } from '~/types/array.js';
import type {
	AnyUnnormalizedHyperschemaModule,
	GetUnnormalizedHyperschemaModuleMigrationSchema
} from '~/types/hyperschema-module.js';
import type { MigrationData } from '~/types/migration.js';

export type GetSchemaFromQuery<Query extends QueryWithHelpers<any, any>> =
	NonNullable<
		ArrayInnerValue<NonNullable<Awaited<ReturnType<Query['exec']>>>>['__type__']
	>;

export interface AnySchemaInstance {
	_id: string;
	_v: string;
}

export type AnySchemaClass = Class<AnySchemaInstance>;

export type BaseSchemaInstance = {
	_id: string;
	_v: string;
	__name__?: string;
};

export type BaseSchemaClass = Class<BaseSchemaInstance> & { _v: string };

export interface NewSchemaOptions {
	from?: new () => BaseSchemaInstance;
}

export interface BaseSchemaExtends<
	SchemaName extends string,
	Options extends NewSchemaOptions
> {
	new <T>(): (Options['from'] extends new () => infer Schema
		? Omit<Schema, '_v' | '__type__' | '__name__'>
		: {}) & {
		__type__?: T;
		__name__?: SchemaName;
		_id: string;
		_v: 'v0';
	};
}

export interface MigrationSchemaExtends<
	PreviousUnnormalizedHyperschemaModule extends
		AnyUnnormalizedHyperschemaModule,
	Options extends {
		omit: {
			[K in keyof GetUnnormalizedHyperschemaModuleMigrationSchema<PreviousUnnormalizedHyperschemaModule>]?: true;
		};
	}
> {
	new <T extends { _v: string; __migration__: MigrationData }>(): Omit<
		GetUnnormalizedHyperschemaModuleMigrationSchema<PreviousUnnormalizedHyperschemaModule>,
		| '_v'
		| '__type__'
		| '__migration__'
		| (Options extends Record<string, unknown>
				? RequiredKeysOf<Options['omit']>
				: never)
	> & {
		__type__?: T;
		_id: string;
	};
}
