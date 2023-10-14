import type { Exact, Opaque } from 'type-fest';
import {
	ShapeObjectProperties,
	ShapeTypeProperties
} from '../types/properties.js';

export function type<T>(): T;
export function type(): any {}

export type Shape<Schema, T extends Exact<ShapeTypeProperties<Schema>, T>> = T;
export function Shape<ShapeType>(
	properties: ShapeObjectProperties<ShapeType>
): ShapeObjectProperties<ShapeType>;
export function Shape(): any {}

export type ForeignRef<ForeignSchema> = typeof ForeignRef<ForeignSchema>;
export const ForeignRef = Object.assign(
	<ForeignSchema>(_foreignRefMarker: Opaque<ForeignSchema, 'ForeignRef'>) => {},
	{ __foreignRef__: true }
);

export type VirtualForeignRef<ForeignSchema> =
	typeof VirtualForeignRef<ForeignSchema>;
export const VirtualForeignRef = Object.assign(
	<ForeignSchema>(
		_virtualForeignRefMarker: Opaque<ForeignSchema, 'VirtualForeignRef'>
	) => {},
	{ __virtualForeignRef__: true }
);
