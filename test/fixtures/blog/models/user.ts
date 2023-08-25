import { ModelSchema, VirtualForeignRef, prop } from "~/index.js";
import { virtualForeignRef } from "../utils/refs.js";
import { Post } from "./post.js";

export class User extends ModelSchema("v0") {
  @prop({
    type: () => String,
    required: true,
  })
  email!: string;

  @prop({
    type: () => String,
    required: false,
  })
  public name?: string;

  @prop(virtualForeignRef("User", "Post", "author"))
  public posts!: VirtualForeignRef<User, Post, "author">[];
}
