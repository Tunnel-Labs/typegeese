import { IsEqual } from 'type-fest';
import { BaseSchemaInstance } from '../../../types/src/types/schema.js';
import type { ArrayInnerValue } from '../../../types/src/types/array.js';
import type { ForeignRef, VirtualForeignRef } from '../../../types/src/types/refs.js';

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
	options: { required: boolean; onDelete: 'Cascade' | 'Restrict' | 'SetNull' }
) {
	return {
		ref: foreignModelName as string,
		type: () => String,
		...options,
		__foreignField: foreignField,
		__relations: {
			onDelete: options.onDelete
		}
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
	}
) {
	return {
		ref: foreignModelName as string,
		type: () => String,
		foreignField,
		localField: '_id'
	};
}