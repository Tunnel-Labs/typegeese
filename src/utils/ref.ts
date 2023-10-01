import { IsEqual } from 'type-fest';
import { AnySchema } from '~/index.js';
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
		[Field in keyof InstanceType<// @ts-expect-error: Works
		ForeignSchema> as NonNullable<
			InstanceType<// @ts-expect-error: Works
			ForeignSchema>[Field]
		> extends
			| ForeignRef<infer M, any, any>
			| ForeignRef<infer M, any, any>[]
			| VirtualForeignRef<infer M, any, any>
			| VirtualForeignRef<infer M, any, any>[]
			? Field
			: never]: true;
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
		[Field in keyof InstanceType<// @ts-expect-error: Works
		ForeignSchema> as NonNullable<
			InstanceType<// @ts-expect-error: Works
			ForeignSchema>[Field]
		> extends ForeignRef<infer M, any, any> | ForeignRef<infer M, any, any>[]
			? Field
			: never]: true;
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
