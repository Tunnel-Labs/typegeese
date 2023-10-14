import mongoose from 'mongoose';

export const createMongoose = () =>
	mongoose.connect('mongodb://tunnel:tunnel@localhost:27017/typegeese_test');
