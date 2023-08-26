# typegeese

Opinionated schema types and utilities built on top of the amazing [Typegoose](<https://github.com/typegoose/typegoose>) library that provides support for a type-safe Prisma-like select API and MongoDB migrations.

**Note:** Typegeese re-exports everything from `@typegoose/typegoose` so you can replace all your existing imports from `@typegoose/typegoose` with `typegeese`.

## Terminology

**Hyperschema:** An object containing a schema, migrations, and delete behavior.

**Hypermodel:** A model augmented with migrations and delete behavior.
