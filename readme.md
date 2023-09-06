# typegeese

Typegeese is a fully type-safe MongoDB ORM built on top of the incredible [Typegoose](https://github.com/typegoose/typegoose) library. The main difference between Typegeese from other ORMs is that Typegeese _makes your schema migrations the source of truth for your schema._

## Painless Migrations

By defining your database schema in the form of schema migrations, data migrations no longer become an afterthought and instead become a first-class construct, making data migrations much less painful.

Typegeese augments MongoDB with the concept of a **hyperschema**, which encompasses a versioned schema, migrations, and foreign relation actions.

## Migration-Defined Schemas

Typegeese schemas are defined in terms of migrations, each of which creates a new "versioned schema." The version first schema for a model extends from `BaseSchema`:

```typescript
// user/v0.ts
import { BaseSchema, VirtualForeignRef, prop, PropType } from "typegeese";

import { virtualForeignRef } from "../../utils/refs.js";
import { Post } from "../post/$schema.js";

export class User extends BaseSchema {
  declare __self: User;

  @prop({ type: () => String, required: true })
  public email!: string;

  @prop({ type: () => String, required: false })
  public name!: string | null;
}
```

When you want to add a new property, you extend the previous version of your schema using Typegeese's `Schema` function:

```typescript
// user/v1-add-posts.ts
import { Schema, VirtualForeignRef, prop, select, getModelForHyperschema } from "typegeese";

import { virtualForeignRef } from "~/utils/refs.js";
import { Post } from "../post/$schema.js";
import * as UserV0 from './v0.ts'

export class User extends Schema(UserV0, "v1-add-posts") {
  declare __self: User;

  @prop(virtualForeignRef("Post", "author", "_id"), PropType.ARRAY)
  public posts!: VirtualForeignRef<User, Post, "author">[];
}
```

When the schema change requires a migration, you can export a `Model_migration` function from the file to apply those migrations:

```typescript
// user/v2.ts
import * as UserV1 from './v1-add-posts.js';
import {
  createMigration,
  getModelForHyperschema,
  select,
  Schema,
} from 'typegeese';

export class User extends Schema(UserV1, "v2-add-username") {
  declare __self: User;

  @prop({ type: () => String, required: true })
  public username!: string;
}

export const migration = createMigration<User>()
  .from(UserV1)
  .with(async function ({ _id }) {
    const UserV1Model = getModelForHyperschema(UserV0, { mongoose: this.mongoose });
    const user = await select(
      UserV1Model.findById(_id),
      { email: true }
    );
    return user;
  })
  .migrate({
    username() {
      return this.email.split("@")[0];
    }
  });
```

For convenience, Typegeese extends a `t` helper that uses TypeScript that allows you to define a TypeScript type containing all of your schema's properties in one place:

```typescript
// user/$schema.ts

import type { t } from 'typegeese';
import type { Post } from '../$schemas.js';

import * as $ from './v2-add-username.js';
export * from './v2-add-username.js';

// This type is type-checked by TypeScript to ensure that it always stays up to date with every new migration
type User = t.Shape<
  $.User,
  {
    _id: string;
    name: string;
    email: string;
    username: string;
    posts: t.VirtualForeignRef<Post>[];
  }
>;
```
