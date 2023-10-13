export interface ValidateStringOptions {
  /** Only allow values that match this RegExp */
  match?: mongoose.SchemaTypeOptions<any>['match'];
  /** Only allow Values from the enum */
  enum?: string[];
  /** Only allow values that have at least this length */
  minlength?: mongoose.SchemaTypeOptions<any>['minlength'];
  /** Only allow values that have at max this length */
  maxlength?: mongoose.SchemaTypeOptions<any>['maxlength'];
}

export interface TransformStringOptions {
  /** Should it be lowercased before save? */
  lowercase?: mongoose.SchemaTypeOptions<any>['lowercase'];
  /** Should it be uppercased before save? */
  uppercase?: mongoose.SchemaTypeOptions<any>['uppercase'];
  /** Should it be trimmed before save? */
  trim?: mongoose.SchemaTypeOptions<any>['trim'];
}

export type PropOptionsForString = BasePropOptions & TransformStringOptions & ValidateStringOptions;