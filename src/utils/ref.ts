import { IsEqual } from 'type-fest';
import { BaseSchemaInstance } from '~/types/schema.js';
import type { ArrayInnerValue } from '~/types/array.js';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

export function foreignRef<
	HostSchemaInstance extends BaseSchemaInstance = never,
	ForeignSchemaInstance extends BaseSchemaInstance = never
>(
	_hostModelName: IsEqual<HostSchemaInstance, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<HostSchemaInstance['__name__']>,
	foreignModelName: IsEqual<HostSchemaInstance, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<ForeignSchemaInstance['__name__']>,
	foreignField: keyof {
		[Field in keyof ForeignSchemaInstance as NonNullable<
			ArrayInnerValue<ForeignSchemaInstance[Field]>
		> extends ForeignRef<ForeignSchemaInstance, HostSchemaInstance, any>
			? Field
			: NonNullable<
					ArrayInnerValue<ForeignSchemaInstance[Field]>
			  > extends VirtualForeignRef<
					ForeignSchemaInstance,
					HostSchemaInstance,
					any
			  >
			? Field
			: never]: ForeignSchemaInstance[Field];
	},
	options: { required: boolean }
) {
	return {
		ref: foreignModelName as string,
		type: () => String,
		...options,
		__foreignField: foreignField
	};
}

export function virtualForeignRef<
	HostSchemaInstance extends BaseSchemaInstance = never,
	ForeignSchemaInstance extends BaseSchemaInstance = never
>(
	_hostModelName: IsEqual<HostSchemaInstance, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<HostSchemaInstance['__name__']>,
	foreignModelName: IsEqual<HostSchemaInstance, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<ForeignSchemaInstance['__name__']>,
	foreignField: keyof {
		[Field in keyof ForeignSchemaInstance as NonNullable<
			ForeignSchemaInstance[Field]
		> extends ForeignRef<ForeignSchemaInstance, HostSchemaInstance, any>
			? Field
			: never]: ForeignSchemaInstance[Field];
	},
	localField: '_id'
) {
	return {
		ref: foreignModelName as string,
		type: () => String,
		foreignField,
		localField
	};
}
