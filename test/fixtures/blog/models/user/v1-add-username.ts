import {
  ModelSchema,
  PropType,
  VirtualForeignRef,
  defineMigration,
  defineOnForeignModelDeletedActions,
  getModelForClass,
  prop,
} from "~/index.js";

import { virtualForeignRef } from "../../utils/refs.js";
import type { Post, Comment } from "../$schemas.js";
import * as UserV0 from "./v0.js";

export class User extends ModelSchema("v1-add-username") {
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

  @prop(virtualForeignRef("Post", "author", "_id"), PropType.ARRAY)
  public posts!: VirtualForeignRef<User, Post, "author">[];

  @prop(virtualForeignRef("Comment", "author", "_id"), PropType.ARRAY)
  public authoredComments!: VirtualForeignRef<User, Comment, "author">[];
}

export const User_migration = defineMigration<typeof UserV0, User>(UserV0, {
  async getDocument({ _id }) {
    return getModelForClass(User).findOne({ _id });
  },
  migrations: {
    async username() {
      return this.email.split("@")[0] ?? "user";
    },
  },
});

export const User_onForeignModelDeletedActions =
  defineOnForeignModelDeletedActions<User>({});
