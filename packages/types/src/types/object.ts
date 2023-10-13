/**
	This type is for lint error "ban-types" where "{}" would be used
	This type is separate from "{@link KeyStringAny}" because it has a different meaning
*/
export type BeAnObject = Record<string, any>;

/**
	This type is for mongoose-specific things where {@link BeAnObject} does not work
	see https://github.com/Automattic/mongoose/issues/13094
*/
// eslint-disable-next-line @typescript-eslint/ban-types
export type BeAnyObject = {};

/** Interface describing a Object that has a "typegooseName" Function */
export interface IObjectWithTypegooseFunction {
  typegooseName(): string;
}
