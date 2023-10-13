export interface InnerOuterOptions {
  /**
		Use this to define inner-options
		Use this if the auto-mapping is not correct or for plugin options
   *
		Please open a new issue if some option is mismatched or not existing / mapped
   */
  innerOptions?: KeyStringAny;
  /**
		Use this to define outer-options
		Use this if the auto-mapping is not correct or for plugin options
   *
		Please open a new issue if some option is mismatched or not existing / mapped
   */
  outerOptions?: KeyStringAny;
}

/**
	Internal type for `utils.mapOptions`
	@internal
*/
export interface MappedInnerOuterOptions {
  /**
		Mapped options for the inner of the Type
   */
  inner: NonNullable<KeyStringAny>;
  /**
		Mapped options for the outer of the type
   */
  outer: NonNullable<KeyStringAny>;
}
