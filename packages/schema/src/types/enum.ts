
/** Type for enum "values" */
// TODO: replace with actual mongoose type if it becomes available
export type EnumValues =
  | Array<string | number | null>
  | ReadonlyArray<string | number | null>
  | { [path: string | number]: string | number | null }; // unlike the mongoose type, "path" is a "string" or "number" here because of how typescript enums work

/** Type for the enum object with custom message*/
// TODO: replace with actual mongoose type if it becomes available
export interface EnumObj {
  values: EnumValues | DeferredFunc<EnumValues>; // unlike the mongoose type, this will have to use "DeferredFunc"
  message?: string;
}

/** Type for combines {@link EnumValues} and {@link @EnumObj} */
export type EnumCombinedType = EnumValues | EnumObj;