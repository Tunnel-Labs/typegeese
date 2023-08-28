import { ReturnModelType, getModelWithString } from "@typegoose/typegoose";
import { User, Comment, Post } from "./$schemas.js";
import { defineMigration, loadHyperschemas } from "~/index.js";
import * as UserHyperschema from "./user/$schema.js";
import * as CommentHyperschema from "./comment/$schema.js";
import * as PostHyperschema from "./post/$schema.js";
import { getMongoose } from "~test/fixtures/blog/utils/mongoose.js";
import onetime from "onetime";

export const getModels = onetime(async () => {
  const mongoose = await getMongoose();

  await loadHyperschemas(
    {
      User: UserHyperschema,
      Comment: CommentHyperschema,
      Post: PostHyperschema,
    },
    { mongoose }
  );

  const UserModel = getModelWithString("User") as ReturnModelType<
    new () => typeof User
  >;

  const CommentModel = getModelWithString("Comment") as ReturnModelType<
    new () => typeof Comment
  >;

  const PostModel = getModelWithString("Post") as ReturnModelType<
    new () => typeof Post
  >;

  return {
    UserModel,
    CommentModel,
    PostModel,
  };
});
