import { ReturnModelType, getModelWithString } from "@typegoose/typegoose";
import { User, Comment, Post } from "./$schemas.js";
import { loadHyperschemas } from "~/index.js";
import * as UserV0Hyperschema from "./user/v0.js";
import * as UserHyperschema from "./user/$schema.js";
import * as CommentHyperschema from "./comment/$schema.js";
import * as PostHyperschema from "./post/$schema.js";
import { getMongoose } from "~test/utils/mongoose.js";
import onetime from "onetime";

export const getModels = onetime(async () => {
  const mongoose = await getMongoose();

  await loadHyperschemas(
    {
      UserV0: UserV0Hyperschema,
      User: UserHyperschema,
      Comment: CommentHyperschema,
      Post: PostHyperschema,
    },
    { mongoose }
  );

  const UserV0Model = getModelWithString("UserV0") as ReturnModelType<
    new () => typeof User
  >;

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
    UserV0Model,
    UserModel,
    CommentModel,
    PostModel,
  };
});
