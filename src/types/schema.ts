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
	new <T extends { _v: number; new (): any }>():
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
	PreviousUnnormalizedHyperschemaModule extends
		AnyUnnormalizedHyperschemaModule,
	Options extends {
		omit: {
			[K in keyof GetUnnormalizedHyperschemaModuleMigrationSchema<PreviousUnnormalizedHyperschemaModule>]?: true;
		};
	}
> {
	// prettier-ignore
	new <T extends { _v: string; migration: MigrationData; new (): any }>():
		Omit<
			GetUnnormalizedHyperschemaModuleMigrationSchema<PreviousUnnormalizedHyperschemaModule>,
			| '_v'
			| '__type__'
			| (
					Options extends Record<string, unknown> ?
						RequiredKeysOf<Options['omit']> :
					never
				)
	> & {
		__type__?: InstanceType<T>;
		_id: string;
	};
}
