import mongoose from "mongoose";

export async function getMongoose() {
  return mongoose.connect("mongodb://localhost:27017/typegeese_test");
}
