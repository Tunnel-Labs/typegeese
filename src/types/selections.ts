import type { UnionToIntersection } from 'type-fest';

import type { SelectInput } from './select.js';

export interface SelectionDefinition<
	_Select,
	_SelectionMappings extends Record<`$${string}`, unknown>
> extends Record<`$${string}`, unknown> {}

export type InferSelectionDefinition<
	SelectionDefinitionGetter extends (...args: any) => any
> = Awaited<ReturnType<SelectionDefinitionGetter>>;

export type ExpandMapping<SelectionMappings, Options> = {
	[OptionKey in keyof Options]: OptionKey extends keyof SelectionMappings
		? ExpandMapping<SelectionMappings, SelectionMappings[OptionKey]>
		: Record<OptionKey, Options[OptionKey]>;
}[keyof Options];

export type SelectionSelect<
	Definition extends SelectionDefinition<any, any>,
	Options
> = Definition extends SelectionDefinition<any, infer SelectionMappings>
	? UnionToIntersection<ExpandMapping<SelectionMappings, Options>>
	: never;

export type WithOptions<
	Definition extends SelectionDefinition<any, any>,
	Model
> = Definition extends SelectionDefinition<any, infer SelectionMappings>
	? SelectInput<Model> & {
			[Key in keyof SelectionMappings]?: boolean;
	  }
	: never;

type Selections<SelectionMappingObject> = keyof {
	[K in keyof SelectionMappingObject as K extends `$${string}`
		? K
		: never]: true;
};

export type RecursivelyExpandSelection<
	SelectionMapping,
	SelectionMappingObject
> = Omit<SelectionMappingObject, `$${string}`> &
	(Selections<SelectionMappingObject> extends never
		? // eslint-disable-next-line @typescript-eslint/ban-types -- We need to intersect with the empty object type
		  {}
		: {
				[K in Selections<SelectionMappingObject>]: K extends keyof SelectionMapping
					? SelectionMapping[K]
					: never;
		  }[Selections<SelectionMappingObject>]);

export interface SelectionContext {}
