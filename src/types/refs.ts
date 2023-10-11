import type { Ref } from '~/types/ref.js';
import type { Opaque } from 'type-fest';
import type { ArrayInnerValue } from '~/types/array.js';

// eslint-disable-next-line @typescript-eslint/ban-types -- All we need is the `name` parameter
export interface ModelRef<Model> {
	_id: string;
	__model: any;
}

/**
	We use this wrapper to force that all foreign refs contain a reference to the original model that references them to help create more robust deletes in MongoDB.
*/
export interface ForeignRef<
	HostModel,
	ForeignModel,
	_ForeignField extends keyof {
		[Field in keyof ForeignModel as NonNullable<
			ArrayInnerValue<ForeignModel[Field]>
		> extends ForeignRef<ForeignModel, HostModel, any>
			? Field
			: NonNullable<
					ArrayInnerValue<ForeignModel[Field]>
			  > extends VirtualForeignRef<ForeignModel, HostModel, any>
			? Field
			: never]: ForeignModel[Field];
	}
> extends Opaque<Ref<ForeignModel>, 'ForeignRef'> {}

/**
	A virtual foreign ref refers to a virtual field
*/
export interface VirtualForeignRef<
	HostModel,
	ForeignModel,
	_ForeignField extends keyof {
		[Field in keyof ForeignModel as NonNullable<
			ForeignModel[Field]
		> extends ForeignRef<ForeignModel, HostModel, any>
			? Field
			: never]: ForeignModel[Field];
	}
> extends Opaque<Ref<ForeignModel>, 'VirtualForeignRef'> {}
