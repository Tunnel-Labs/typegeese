import type { ForeignRef, VirtualForeignRef } from '~/types/refs.js';

// prettier-ignore
export type SelectInput<Model> = {
	[
		K in keyof Model as
			K extends '__type__' ?
				never :
			K extends '_v' ?
				never :
			K
	]?:
		NonNullable<Model[K]> extends (infer InnerValue)[] ?
			NonNullable<InnerValue> extends VirtualForeignRef<any, infer Nested, infer _ForeignField> ?
				{ select: SelectInput<Nested> } :
			NonNullable<InnerValue> extends ForeignRef<any, infer Nested, any> ?
				{ select: SelectInput<Nested> } :
			true :
		NonNullable<Model[K]> extends VirtualForeignRef<any, infer Nested, infer _ForeignField> ?
			{ select: SelectInput<Nested> } :
		NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any> ?
			{ select: SelectInput<Nested> } :
		true
};

export type SelectOutputWithVersion<
	Model,
	Select extends SelectInput<Model>
> = SelectOutput<Model, Select, true>;

// prettier-ignore
export type SelectOutput<
	Model,
	Select extends SelectInput<Model>,
	WithVersion extends boolean = false
> = { _id: string, __type__?: Model } & (WithVersion extends true ? { _v: string } : {}) & {
	[K in keyof Select]
		: Select[K] extends true
			? K extends keyof Model
				? null extends Model[K]
					? Model[K] | null
					: Model[K]
				: never

		: Select[K] extends { select: infer NestedSelect }
			? K extends keyof Model

				? NonNullable<Model[K]> extends VirtualForeignRef<any, infer Nested, infer _ForeignField>[]
					? null extends Model[K]
						// @ts-expect-error: works
						? SelectOutput<Nested, NestedSelect, WithVersion>[] | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect, WithVersion>[]

				: NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any>[]
					? null extends Model[K]
						// @ts-expect-error: works
						? SelectOutput<Nested, NestedSelect, WithVersion>[] | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect, WithVersion>[]

				: NonNullable<Model[K]> extends VirtualForeignRef<any, infer Nested, infer _ForeignField>
						? null extends Model[K]
							// @ts-expect-error: works
							? SelectOutput<Nested, NestedSelect, WithVersion> | null
							// @ts-expect-error: works
							: SelectOutput<Nested, NestedSelect, WithVersion>

				: NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any>
					? null extends Model[K]
						// @ts-expect-error: works
						? SelectOutput<Nested, NestedSelect, WithVersion> | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect, WithVersion>

				: never

			: never
		: never
};
