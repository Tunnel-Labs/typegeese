import type * as mongoose from 'mongoose';

export type Initialize = ({
	mongoose,
	meta
}: {
	mongoose: mongoose.Mongoose;
	meta: any;
}) => void | Promise<void>;
