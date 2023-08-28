import { ForeignRef, ModelSchema, prop } from "~/index.js";
import type { Post, User } from "../$schemas.js";
import { foreignRef } from "../../utils/refs.js";

export class Comment extends ModelSchema("v0") {
  @prop({
    type: () => String,
    required: true,
  })
  public text: string;

  @prop(foreignRef("User", "authoredComments", { required: true }))
  public author!: ForeignRef<Comment, User, "authoredComments">;

  @prop(foreignRef("Post", "comments", { required: true }))
  public post!: ForeignRef<Comment, Post, "comments">;
}
