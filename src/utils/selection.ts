import { deepmerge } from 'deepmerge-ts';
import type { Promisable, UnionToIntersection } from 'type-fest';

import type { SelectInput } from '../types/select.js';
import type {
	RecursivelyExpandSelection,
	SelectionContext,
	SelectionDefinition
} from '../types/selections.js';

export type ExpandSelections<
	SelectionMappings extends Record<string, Record<string, unknown>>
> = {
	[Key in keyof SelectionMappings]: RecursivelyExpandSelection<
		SelectionMappings,
		SelectionMappings[Key]
	>;
};

export function expandSelections<
	SelectionMapping extends Record<string, Record<string, unknown>>
>(selectionMapping: SelectionMapping): ExpandSelections<SelectionMapping> {
	function expandInnerSelection(mapping: Record<string, unknown>): void {
		for (const mappingKey of Object.keys(mapping)) {
			if (mappingKey.startsWith('$')) {
				expandInnerSelection(selectionMapping[mappingKey] ?? {});
				Object.assign(mapping, selectionMapping[mappingKey]);
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- We need to delete the key
				delete mapping[mappingKey];
			}
		}
	}

	for (const topLevelMappingValue of Object.values(selectionMapping)) {
		expandInnerSelection(topLevelMappingValue);
	}

	return selectionMapping as any;
}

export function createSelectionFunction<
	Definition extends SelectionDefinition<any, any>
>(selectionDefinition: Definition) {
	type Select = Definition extends SelectionDefinition<infer Select, any>
		? Select
		: never;
	type SelectionMappings = Definition extends SelectionDefinition<
		any,
		infer SelectionMappings
	>
		? SelectionMappings
		: never;

	type ExpandedSelections = ExpandSelections<SelectionMappings>;

	const expandedSelections = expandSelections(selectionDefinition as any);

	return function select<
		Selections extends Select & {
			[K in keyof SelectionMappings]?: boolean | undefined;
		}
	>(
		selections: Selections
	): UnionToIntersection<
		{
			[SelectionKey in keyof Selections]: SelectionKey extends `$${string}`
				? ExpandedSelections[SelectionKey]
				: Record<SelectionKey, Selections[SelectionKey]>;
		}[keyof Selections]
	> {
		const selectionsArray = [];

		for (const [selectionKey, selectionValue] of Object.entries(selections)) {
			if (selectionKey.startsWith('$')) {
				selectionsArray.push((expandedSelections as any)[selectionKey]);
			} else {
				selectionsArray.push({ [selectionKey]: selectionValue });
			}
		}

		return deepmerge(...selectionsArray) as any;
	};
}

/**
	Creates a type-safe wrapper function for defining selections
*/
export function defineSelectionMappings<Model>(): {
	set<
		SelectionMappings extends Record<
			`$${string}`,
			SelectInput<Model> & { [K in keyof SelectionMappings]?: boolean }
		>
	>(
		mappings: (context: SelectionContext) => Promisable<SelectionMappings>
	): (
		context: SelectionContext
	) => SelectionDefinition<SelectInput<Model>, SelectionMappings>;
} {
	const set = (
		selectionsCallback: (context: SelectionContext) => Promise<any>
	): any =>
		async function selectionsCallbackWrapper(context: SelectionContext) {
			try {
				return await selectionsCallback(context);
			} catch {
				return {};
			}
		} as any;

	return { set } as any;
}
