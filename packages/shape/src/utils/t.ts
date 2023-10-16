import type { Exact, Opaque } from 'type-fest';
import {
	ShapeObjectProperties,
	ShapeTypeProperties
} from '../types/properties.js';
import type { ShapeForeignRef, ShapeVirtualForeignRef } from '../types/ref.js';

export function type<T>(): T;
export function type(): any {}

export type Shape<Schema, T extends Exact<ShapeTypeProperties<Schema>, T>> = T;
export function Shape<ShapeType>(
	properties: ShapeObjectProperties<ShapeType>
): ShapeObjectProperties<ShapeType>;
export function Shape(): any {}

export type ForeignRef<ForeignSchema> = ShapeForeignRef<
	// @ts-expect-error: works
	NonNullable<ForeignSchema['__name__']>
>;
export const ForeignRef = Object.assign(
	<ForeignSchemaName extends string>(
		foreignSchemaName: ForeignSchemaName
	): ShapeForeignRef<ForeignSchemaName> => foreignSchemaName,
	{ __foreignRef__: true }
);

export type VirtualForeignRef<ForeignSchema> = ShapeVirtualForeignRef<
	// @ts-expect-error: works
	NonNullable<ForeignSchema['__name__']>
>;
export const VirtualForeignRef = Object.assign(
	<ForeignSchemaName extends string>(
		virtualForeignSchemaName: ForeignSchemaName
	): ShapeVirtualForeignRef<ForeignSchemaName> => virtualForeignSchemaName,
	{ __virtualForeignRef__: true }
);
