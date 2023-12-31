<p align="center">
  <img src="./assets/mascot.png" width="200px" align="center" alt="typegeese mascot" />
  <h1 align="center">Typegeese</h1>
  <p align="center">
    Painless database migrations via <strong>migration-defined schemas</strong>
  </p>
</p>
<br/>

Typegeese is a type-safe ORM for MongoDB which introduces the concept of _migration-defined schemas_.

With Typegeese, your schema migrations become the source of truth for the structure of your data.

This makes it possible for Typegeese to automatically apply schema migrations on-demand without the need for migration generation scripts or complex data migration processes.

> **Note:** Typegeese is currently _experimental_; expect bugs, breaking changes, and incomplete documentation 😅

## Migration-defined schemas

Typegeese schemas are defined in terms of migrations, each of which creates a new versioned schema.

These migrations are defined using TypeScript classes powered by the amazing [typegoose](https://github.com/typegoose/typegoose) library (which is where the name _typegeese_ is inspired from).

The first version (v0) of a schema extends from `Schema('Name')`:

```typescript
// ./user/v0.ts
import { Schema, prop } from "typegeese";

export default class User extends Schema('User')<typeof User> {
  static _v = 0;

  @prop({ type: String, required: true })
  email!: string;

  @prop({ type: String, required: false })
  name!: string | null;
}
```

```typescript
// ./user/$schema.ts
export { default as User } from './v0.js';
```

<details>
  <summary>Why does <code>Schema(...)</code> need a generic type argument?</summary>

  <hr />
  The generic type argument after <code>Schema(...)</code> is used by typegeese's internal types to look up the schema type from a mongoose model query. For example:

  ```typescript
  const user: User = await select(UserModel.findOne(...), { ... });
  //          ^ The generic type argument in the schema class definition
  //            allows typegeese to infer the correct `User` schema type
  //            from this call
  ```

  Typegeese also uses this generic type argument to verify that the mandatory "_v" property is present on the class.

  <hr />
</details>

When you want to add a new property, you extend the previous version of your schema by passing it to typegeese's `Schema` function:

```typescript
// ./user/v1-add-profile-image.ts
import { type Migrate, Schema, prop } from "typegeese";

import UserV0 from './v0.js';

export default class User extends Schema(UserV0)<typeof User> {
  static _v = 'v1-profile-image';

  @prop({ type: String, required: false })
  profileImageUrl!: string | null;

  static _migration: Migrate = (migrate: Migrate<UserV0, User>) =>
    migrate({ profileImageUrl: null });
}
```

```typescript
// ./user/$schema.ts
export * from './v1-add-profile-image.js';
```

The static `_migration` property can handle arbitrarily complex migrations:

```typescript
// ./user/v2-add-username.ts
import {
  getModelForSchema,
  type Migrate,
  prop,
  Schema,
  select
} from 'typegeese';

import UserV1 from './v1-add-profile-image.js';

export default class User extends Schema(UserV1)<typeof User> {
  static _v = 'v2-add-username';

  @prop({ type: String, required: true })
  username!: string;

  static _migration: Migrate = async (migrate: Migrate<UserV1, User>) => {
    const { _id, mongoose } = migrate;
    const UserV1Model = getModelForSchema(UserV1, { mongoose });
    const user = await select(
      UserV1Model.findById(_id),
      { email: true }
    );

    if (user === null) return null;

    return migrate({
      username: user.email.split('@')[0]
    })
  }
}
```

```typescript
// ./user/$schema.ts
export { default as User } from './v2-add-username.js';
```

If you want to be able to view all your schema's properties in one place, you can install and use `@typegeese/shape`, which comes with a `t` helper that leverages TypeScript inference to define a type containing your schema's properties:

```typescript
// ./user/$schema.ts
export { default as User } from './v2-add-username.js';

import type { t } from '@typegeese/shape';
import type * as $ from '../$schemas.js';

// This type is type-checked by TypeScript to ensure
// that it always stays up to date with every new migration
export type UserShape = t.Shape<
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

The `t` helper can also be used to define the shape of your schema at runtime:

```typescript
// ./user/$shape.ts
import { t } from '@typegeese/shape'

import type { UserShape } from './$schema.js';

// Typegeese's `t` helper also lets you declare the shape of
// your schema at runtime which can be imported from the
// client side (it's recommended to use a separate file for
// the runtime definition so your bundler doesn't end up
// importing server-side code)
export const User = t.Shape<UserShape>({
  _id: t,
  name: t,
  email: t,
  profileImageUrl: t,
  username: t
});
```

## Examples

The examples use the following UserV0 schema:

```typescript
// ./user/v0.ts
import { Schema, prop } from 'typegeese';

export default class User extends Schema('User')<typeof User> {
  static _v = 0;

  @prop({ type: String, required: true })
  email!: string;

  @prop({ type: String, required: false })
  name!: string | null;
}
```

### Adding a new field

```typescript
// ./user/v1-add-username.ts
import {
  type Migrate,
  Schema,
  prop,
  getModelForSchema,
  select,
  type Migrate
} from 'typegeese';

import UserV0 from './v0.js';

export default class User extends Schema(UserV0)<typeof User> {
  static _v = 'v1-add-username';

  @prop({ type: String, required: true })
  username!: string;

  static _migration: Migrate = (migrate: Migrate<UserV0, User>) => {
    const { _id, mongoose } = migrate;
    const UserV0Model = getModelForSchema(UserV0, { mongoose });
    const user = await select(
      UserV0Model.findById(_id),
      { email: true }
    );

    if (user === null) return null;

    return migrate({
      username: user.email.split('@')[0]
    })
  }
}
```

### Removing a field

```typescript
// ./user/v1-remove-name.ts
import { type Migrate, Schema, prop } from 'typegeese';

import UserV0 from './v0.js';

export default class User extends Schema(
  UserV0
  { omit: { name: true } }
)<typeof User> {
  static _v = 'v1-remove-name';

  static _migration: Migrate = (migrate: Migrate<UserV0, User>) => migrate({})
}
```

### Renaming a field

```typescript
// ./user/v1-rename-name-to-full-name.ts
import {
  type Migrate,
  Schema,
  prop,
  getModelForSchema,
  select
} from 'typegeese';

import UserV0 from './v0.js';

export default class User extends Schema(
  UserV0,
  { omit: { name: true } }
)<typeof User> {
  static _v = 'v1-rename-name-to-full-name';

  @prop({ type: String, required: false })
  fullName!: string | null;

  static _migration: Migrate = (migrate: Migrate<User, UserV0>) => {
    const { _id, mongoose } = migrate;
    const UserV0Model = getModelForSchema(UserV0, { mongoose });
    const user = await select(
      UserV0Model.findById(_id),
      { name: true }
    );

    if (user === null) return null;

    return migrate({
      fullName: user.name
    })
  }
}
```

### Renaming a schema

In order to preserve compatibility with a blue/green deployment strategy, typegeese handles schema renames by running queries on both the old collection and the new renamed collection, and then lazily copying over documents into the new collection as they are queried from the renamed model.

```typescript
// ./_user/v1-rename-to-account.ts
// ^ We rename the folder to use an underscore prefix to indicate that it was renamed

import {
  type Migrate,
  Schema,
  prop,
  getModelForSchema,
  select
} from 'typegeese';
import UserV0 from './v0.js';

export default class User extends Schema(UserV0)<typeof User> {
  static _v = 'v1-rename-to-account';

  static _migration: Migrate = (migrate: Migrate<UserV0, User>) => migrate({})
}
```

```typescript
// ./account/v0.ts

import { User } from '../_user/$schema.js';

export class Account extends Schema('Account', { from: User })<typeof Account> {
  static _v = 0;
}
```

## Implementation

The `Schema(...)` function is used purely for type inference and returns the `Object` constructor at runtime:

```typescript
class User extends Schema('User')<typeof User> { /* ... */ }
class Post extends Schema(PostV0)<typeof Post> { /* ... */ }

// Equivalent at runtime to:
class User extends Object {}
class Post extends Object {}
```

> In practice, `extends Object` is equivalent to omitting the `extends` clause.

By returning the `Object` constructor in the extends clause, we avoid using inheritance for migrations. This reduces the chance of conflicts with typegoose's intended uses of inheritance (e.g. for discriminator types).

Instead, typegeese dynamically constructs schemas at runtime when the functions `getModelForSchema` or `loadModelSchemas` are called.

## Limitations

Currently, typegeese expects that there exists only one reference to its internal functions (since it uses `Reflect#getMetadata` and `Reflect#defineMetadata`). This means that you must mark typegeese as external when using a bundler like Webpack.
