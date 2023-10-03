import { IsEqual } from 'type-fest';
import { AnySchema } from '~/types/schema.js';
import type { ArrayInnerValue } from '~/types/array.js';
import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

export function foreignRef<
	HostSchema extends AnySchema = never,
	ForeignSchema extends AnySchema = never
>(
	_hostModelName: IsEqual<HostSchema, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<HostSchema['__name__']>,
	foreignModelName: IsEqual<HostSchema, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<ForeignSchema['__name__']>,
	foreignField: keyof {
		[Field in keyof ForeignSchema as NonNullable<
			ArrayInnerValue<ForeignSchema[Field]>
		> extends ForeignRef<ForeignSchema, HostSchema, any>
			? Field
			: NonNullable<
					ArrayInnerValue<ForeignSchema[Field]>
			  > extends VirtualForeignRef<ForeignSchema, HostSchema, any>
			? Field
			: never]: ForeignSchema[Field];
	},
	options: { required: boolean }
) {
	return {
		ref: foreignModelName,
		type: () => String,
		...options,
		__foreignField: foreignField
	};
}

export function virtualForeignRef<
	HostSchema extends AnySchema = never,
	ForeignSchema extends AnySchema = never
>(
	_hostModelName: IsEqual<HostSchema, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<HostSchema['__name__']>,
	foreignModelName: IsEqual<HostSchema, never> extends true
		? 'Error: virtualForeignRef requires two generic type parameters'
		: NonNullable<ForeignSchema['__name__']>,
	foreignField: keyof {
		[Field in keyof ForeignSchema as NonNullable<
			ForeignSchema[Field]
		> extends ForeignRef<ForeignSchema, HostSchema, any>
			? Field
			: never]: ForeignSchema[Field];
	},
	localField: '_id'
) {
	return {
		ref: foreignModelName,
		type: () => String,
		foreignField,
		localField
	};
}
