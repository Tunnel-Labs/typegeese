/**
	Symbol to track if options have already been merged
	This is to reduce the "merge*" calls, which dont need to be run often if already done
*/
export const AlreadyMerged = Symbol('MOAlreadyMergedOptions');