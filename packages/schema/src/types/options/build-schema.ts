/** Extra options for "_buildSchema" in "schema.ts" */
export interface IBuildSchemaOptions {
	/**
		Add indexes from this class?
		will be "false" when "ICustomOptions.disableLowerIndexes" is "true" for some upper class
		@default true
	*/
	buildIndexes?: boolean;
}
