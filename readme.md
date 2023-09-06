# typegeese

typegeese is a type-safe ORM for MongoDB which introduces the concept of **migration-defined schemas.**

With typegeese, your schema migrations are the source of truth for the structure of your data. Combined with the flexibility of MongoDB and the fully type-safe [typegoose](https://github.com/typegoose/typegoose) library, migration-defined schemas allow typegeese to automatically apply schema migrations on-demand without the need for migration generation scripts or migration-induced downtime.

## Migration-Defined Schemas

typegeese schemas are defined in terms of migrations, each of which creates a new versioned schema. The version first schema for a model extends from `BaseSchema`:

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

When you want to add a new property, you extend the previous version of your schema using typegeese's `Schema` function:

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
// user/v2-add-username.ts
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

For convenience, typegeese extends a `t` helper that uses TypeScript that allows you to define a TypeScript type containing all of your schema's properties in one place:

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
