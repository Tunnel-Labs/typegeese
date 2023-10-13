export interface ITypegooseOptions {
  /**
		Option to disable caching globally
		completely disables the "constructors" and "models" maps
		"false" and "undefined" have the same result of enabling caching
		@default false
   */
  disableGlobalCaching?: boolean;
}