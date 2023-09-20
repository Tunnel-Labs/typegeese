<p align="center">
  <img src="./assets/mascot.png" width="200px" align="center" alt="typegeese mascot" />
  <h1 align="center">typegeese</h1>
  <p align="center">
    <br/>
    painless database migrations via <strong>migration-defined schemas</strong>
  </p>
</p>
<br/>

typegeese is a type-safe ORM for MongoDB which introduces the concept of **migration-defined schemas.**

With typegeese, your schema migrations become the source of truth for the structure of your data. This makes it possible for typegeese to automatically apply schema migrations on-demand without the need for migration generation scripts or complex data migration processes.

> **Note:** typegeese is currently _experimental_; expect bugs, breaking changes, and incomplete documentation 😅

## Migration-Defined Schemas

typegeese schemas are defined in terms of migrations, each of which creates a new versioned schema. These migrations are defined using TypeScript classes powered by the amazing [typegoose](https://github.com/typegoose/typegoose) library (which is where the name _typegeese_ is inspired from).

The first version (v0) of a schema extends from `BaseSchema`:

```typescript
// ./user/v0.ts
import { BaseSchema, prop } from "typegeese";

export class User extends BaseSchema {
  @prop({ type: () => String, required: true })
  public email!: string;

  @prop({ type: () => String, required: false })
  public name!: string | null;
}
```

When you want to add a new property, you extend the previous version of your schema using typegeese's `Schema` function:

```typescript
// ./user/v1-add-profile-image.ts
import { Schema, prop } from "typegeese";

import * as UserV0 from './v0.ts'

export class User extends Schema(UserV0, "v1-profile-image") {
  @prop({ type: () => String, required: false })
  public profileImageUrl!: string | null;
}
```

When the schema change requires a migration, you can export a `Model_migration` function from the file to apply those migrations:

```typescript
// ./user/v2-add-username.ts
import {
  createMigration,
  getModelForHyperschema,
  select,
  Schema,
  prop
} from 'typegeese';

import * as UserV1 from './v1-add-profile-image.js';

export class User extends Schema(UserV1, "v2-add-username") {
  @prop({ type: () => String, required: true })
  public username!: string;
}

export const User_migration = createMigration<User>()
  .from(UserV1)
  .with(async function ({ _id }) {
    const UserV1Model = getModelForHyperschema(UserV1, { mongoose: this.mongoose });
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

For convenience, typegeese exports a `t` helper that uses TypeScript that allows you to define a TypeScript type containing all of your schema's properties in one place:

```typescript
// user/$schema.ts

import type { t } from 'typegeese';

import * as $ from './v2-add-username.js';
export * from './v2-add-username.js';

// This type is type-checked by TypeScript to ensure that it always stays up to date with every new migration
type User = t.Shape<
  $.User,
  {
    _id: string;
    name: string | null;
    email: string;
    profileImageUrl: string | null;
    username: string;
  }
>;
```
