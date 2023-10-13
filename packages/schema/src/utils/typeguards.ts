import * as mongoose from 'mongoose';
import { logger } from './log-settings.js';
import type {
	AnyParamConstructor,
	DocumentType,
	Ref,
	RefType
} from '@-/types';

/**
	Check if the given document is populated
	@param doc The Ref with uncertain type
*/
export function isDocument<T, S extends RefType>(
	doc: Ref<T, S> | null | undefined
): doc is DocumentType<T> {
	return doc instanceof mongoose.Model;
}

/**
	Check if the given array is fully populated
	Only returns "true" if all members in the array are populated
	@param docs The Array of Refs with uncertain type
*/
export function isDocumentArray<T, S extends RefType>(
	docs: mongoose.Types.Array<Ref<T, S>> | null | undefined
): docs is mongoose.Types.Array<DocumentType<NonNullable<T>>>;
/**
	Check if the given array is fully populated
	Only returns "true" if all members in the array are populated
	@param docs The Array of Refs with uncertain type
*/
export function isDocumentArray<T, S extends RefType>(
	docs: Ref<T, S>[] | null | undefined
): docs is DocumentType<NonNullable<T>>[];
export function isDocumentArray(
	docs: Ref<any, any>[] | null | undefined
): unknown {
	// its "any" & "unknown" because this is not listed as an overload
	return Array.isArray(docs) && docs.every((v) => isDocument(v));
}

type AllowedRefTypes =
	| typeof String
	| typeof Number
	| typeof Buffer
	| typeof mongoose.Types.ObjectId
	| typeof mongoose.Types.Buffer;

/**
	Check if the document is of type "refType"
	@param doc The Ref with uncretain type
	@param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
*/
export function isRefType<T, S extends RefType>(
	doc: Ref<T, S> | null | undefined,
	refType: AllowedRefTypes
): doc is NonNullable<S> {
	logger.info('isRefType:', refType);

	if (isNullOrUndefined(doc) || isDocument(doc)) {
		return false;
	}

	// this "ObjectId" test is in the front, because its the most common - to lower resource use
	if (refType === mongoose.Types.ObjectId) {
		return doc instanceof mongoose.Types.ObjectId;
	}
	if (refType === String) {
		return typeof doc === 'string';
	}
	if (refType === Number) {
		return typeof doc === 'number';
	}
	if (refType === Buffer || refType === mongoose.Types.Buffer) {
		return doc instanceof Buffer;
	}

	return false;
}

/**
	Check if the array is fully of type "refType"
	Only returns "true" if all members in the array are of type "refType"
	@param docs The Ref with uncretain type
	@param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
*/
export function isRefTypeArray<T, S extends RefType>(
	docs: mongoose.Types.Array<Ref<T, S>> | null | undefined,
	refType: AllowedRefTypes
): docs is mongoose.Types.Array<NonNullable<S>>;
/**
	Check if the array is fully of type "refType"
	Only returns "true" if all members in the array are of type "refType"
	@param docs The Ref with uncretain type
	@param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
*/
export function isRefTypeArray<T, S extends RefType>(
	docs: Ref<T, S>[] | null | undefined,
	refType: AllowedRefTypes
): docs is NonNullable<S>[];
export function isRefTypeArray(
	docs: Ref<any, any>[] | null | undefined,
	refType: AllowedRefTypes
): unknown {
	// its "any" & "unknown" because this is not listed as an overload
	return Array.isArray(docs) && docs.every((v) => isRefType(v, refType));
}

/**
	Check if the input is a mongoose.Model
	@param model The Value to check
*/
export function isModel(model: any): model is mongoose.Model<any> {
	return model?.prototype instanceof mongoose.Model;
}

/**
	Returns true, if it is an Number
	@param Type The Type to test
	@returns true, if it is an Number
*/
export function isNumber(Type: any): Type is number {
	const name = Type?.name ?? '';

	return name === 'Number' || name === mongoose.Schema.Types.Number.name;
}

/**
	Returns true, if it is an String
	@param Type The Type to test
	@returns true, if it is an String
*/
export function isString(Type: any): Type is string {
	const name = Type?.name ?? '';

	return name === 'String' || name === mongoose.Schema.Types.String.name;
}
