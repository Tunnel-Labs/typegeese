import { ForeignRef, ModelSchema, prop } from "~/index.js";
import type { User } from "./user.js";
import { foreignRef } from "../utils/refs.js";

export class Post extends ModelSchema("v0") {
  @prop({
    type: () => String,
    required: true,
  })
  public title: string;

  @prop({
    type: () => String,
    required: true,
  })
  public content: string;

  @prop({
    type: () => Boolean,
    required: true,
  })
  public published!: boolean;

  @prop(foreignRef("Post", "User", "_id"))
  public author!: ForeignRef<Post, User, "posts">;
}
