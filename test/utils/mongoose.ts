import mongoose from "mongoose";
import onetime from "onetime";

export const getMongoose = onetime(() =>
  mongoose.connect("mongodb://tunnel:tunnel@localhost:27017/admin")
);
