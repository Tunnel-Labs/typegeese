import type * as mongoose from 'mongoose';
import type { BasePropOptions } from '../$.js';

export interface VirtualOptions {
	/** Reference another Document (Ref<T> should be used as property type) */
	ref: NonNullable<BasePropOptions['ref']>;

	/** Which property(on the current-Class) to match `foreignField` against */
	localField: mongoose.VirtualTypeOptions['localField'];

	/** Which property(on the ref-Class) to match `localField` against */
	foreignField: mongoose.VirtualTypeOptions['foreignField'];

	/** Return as One Document(true) or as Array(false) */
	justOne?: mongoose.VirtualTypeOptions['justOne'];

	/** Return the number of Documents found instead of the actual Documents */
	count?: mongoose.VirtualTypeOptions['count'];

	/** Extra Query Options */
	options?: mongoose.VirtualTypeOptions['options'];

	/** Match Options */
	match?: mongoose.VirtualTypeOptions['match'];

	/**
		If you set this to `true`, Mongoose will call any custom getters you defined on this virtual.

		Note: Copied from mongoose's "index.d.ts"#VirtualTypeOptions
	*/
	getters?: mongoose.VirtualTypeOptions['getters'];

	/**
		Add a default `limit` to the `populate()` query.

		Note: Copied from mongoose's "index.d.ts"#VirtualTypeOptions
	*/
	limit?: mongoose.VirtualTypeOptions['limit'];

	/**
		Add a default `skip` to the `populate()` query.

		Note: Copied from mongoose's "index.d.ts"#VirtualTypeOptions
	*/
	skip?: mongoose.VirtualTypeOptions['skip'];

	/**
		For legacy reasons, `limit` with `populate()` may give incorrect results because it only
		executes a single query for every document being populated. If you set `perDocumentLimit`,
		Mongoose will ensure correct `limit` per document by executing a separate query for each
		document to `populate()`. For example, `.find().populate({ path: 'test', perDocumentLimit: 2 })`
		will execute 2 additional queries if `.find()` returns 2 documents.

		Note: Copied from mongoose's "index.d.ts"#VirtualTypeOptions
	*/
	perDocumentLimit?: mongoose.VirtualTypeOptions['perDocumentLimit'];

	// for plugins / undocumented types
	[extra: string]: any;
}
