import type { Deprecated } from "~/types/deprecated.js";
import type { ForeignRef, VirtualForeignRef } from "~/types/refs.js";

// prettier-ignore
export type SelectInput<Model> = {
	[K in keyof Model as
		Model[K] extends Deprecated
			? never
			: Model[K] extends Deprecated[]
				? never
		: K
	]?
		: NonNullable<Model[K]> extends (infer InnerValue)[]
			? NonNullable<InnerValue> extends VirtualForeignRef<any, infer Nested, infer _ForeignField>
				? { select: SelectInput<Nested> }
			: NonNullable<InnerValue> extends ForeignRef<any, infer Nested, any>
				? { select: SelectInput<Nested> }
			: true

		: NonNullable<Model[K]> extends VirtualForeignRef<any, infer Nested, infer _ForeignField>
			? { select: SelectInput<Nested> }
		: NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any>
			? { select: SelectInput<Nested> }

		: true
};

export type SelectOutputWithoutVersion<
  Model,
  Select extends SelectInput<Model>,
> = Omit<SelectOutput<Model, Select>, "_version">;

// prettier-ignore
export type SelectOutput<Model, Select extends SelectInput<Model>> = { _id: string, _version: string } & {
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
						? SelectOutput<Nested, NestedSelect>[] | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect>[]

				: NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any>[]
					? null extends Model[K]
						// @ts-expect-error: works
						? SelectOutput<Nested, NestedSelect>[] | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect>[]

				: NonNullable<Model[K]> extends VirtualForeignRef<any, infer Nested, infer _ForeignField>
						? null extends Model[K]
							// @ts-expect-error: works
							? SelectOutput<Nested, NestedSelect> | null
							// @ts-expect-error: works
							: SelectOutput<Nested, NestedSelect>

				: NonNullable<Model[K]> extends ForeignRef<any, infer Nested, any>
					? null extends Model[K]
						// @ts-expect-error: works
						? SelectOutput<Nested, NestedSelect> | null
						// @ts-expect-error: works
						: SelectOutput<Nested, NestedSelect>

				: never

			: never
		: never
};
