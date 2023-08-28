# typegeese

Opinionated schema types and utilities built on top of the amazing [Typegoose](<https://github.com/typegoose/typegoose>) library that provides support for a type-safe Prisma-like select API and MongoDB migrations.

**Note:** Typegeese re-exports everything from `@typegoose/typegoose` so you can replace all your existing imports from `@typegoose/typegoose` with `typegeese`.

## Terminology

**Hyperschema:** An object containing a schema, migrations, and the  on foreign model delete actions.

**Hypermodel:** A model augmented with migrations and delete behavior.

## Migrations

Typegeese comes with support for built-in schema migrations. It does this by adding a `_v` property to every document that tracks the document's current schema version.

```typescript
// user/v0.ts
import { ModelSchema, VirtualForeignRef, prop } from "~/index.js";

import { virtualForeignRef } from "../../utils/refs.js";
import { Post } from "../post/$schema.js";

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

  @prop(virtualForeignRef("User", "Post", "author"))
  public posts!: VirtualForeignRef<User, Post, "author">[];
}
```

```typescript
// user/v1.ts
import { ModelSchema, VirtualForeignRef, prop } from "~/index.js";

import { virtualForeignRef } from "../../utils/refs.js";
import { Post } from "../post/$schema.js";
import * as UserV0 from './v0.ts'

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
  // The read-only document to use for the migration
  async getDocument({ _id }) {
    return getModelForClass('User').findOne({ _id });
  },
  migrations: {
    async username() {
      this.username = this.email.split("@")[0];
    },
  },
});
```
