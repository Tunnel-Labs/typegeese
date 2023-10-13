/**
	Returns true, if the type is included in mongoose.Schema.Types
	@param Type The Type to test
	@returns true, if it includes it
*/
export function isPrimitive(Type: any): boolean {
  if (typeof Type?.name === 'string') {
    // try to match "Type.name" with all the Property Names of "mongoose.Schema.Types"
    // (like "String" with "mongoose.Schema.Types.String")
    return (
      Object.getOwnPropertyNames(mongoose.Schema.Types).includes(Type.name) ||
      // try to match "Type.name" with all "mongoose.Schema.Types.*.name"
      // (like "SchemaString" with "mongoose.Schema.Types.String.name")
      Object.values(mongoose.Schema.Types).findIndex((v) => v.name === Type.name) >= 0
    );
  }

  return false;
}