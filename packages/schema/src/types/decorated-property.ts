import type { AnyParamConstructor, KeyStringAny } from '../types/$.js';
import { PropType } from '../enums/$.js';

/** Type for the Values stored in the Reflection for Properties */
export interface DecoratedPropertyMetadata {
	/** Prop Options */
	options: KeyStringAny;
	/** The Target Reflection target for getting metadata from keys */
	target: AnyParamConstructor<any>;
	/** Property name */
	key: string | symbol;
	/** What is it for a prop type? */
	propType?: PropType;
}

export type DecoratedPropertyMetadataMap = Map<
	string | symbol,
	DecoratedPropertyMetadata
>;
