export interface ShapeForeignRef<_SchemaName extends string> {
	__foreignRef__: _SchemaName;
}
export interface ShapeVirtualForeignRef<_SchemaName extends string> {
	__virtualForeignRef__: _SchemaName;
}
