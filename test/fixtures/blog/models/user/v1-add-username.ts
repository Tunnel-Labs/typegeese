import { ModelSchema, VirtualForeignRef, defineMigration, prop } from "~/index.js";

import { virtualForeignRef } from "../../utils/refs.js";
import { Post } from "../post/$schema.js";
import * as UserV0 from './v0.js'

export class User extends ModelSchema("v0") {
  @prop({
    type: () => String,
    required: true,
  })
  public email!: string;

  @prop({
    type: () => String,
    required: false,
  })
  public name?: string;

  @prop({
    type: () => String,
    required: true,
  })
  public username!: string;

  @prop(virtualForeignRef("User", "Post", "author"))
  public posts!: VirtualForeignRef<User, Post, "author">[];
}

export const migration = defineMigration<typeof UserV0, User>(UserV0, {
})