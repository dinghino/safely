# Seed functions

This folder is meant to contain modularized seeding functions that are to be
called from the `convex/seed.ts` internal mutation, and are used to initialize
or reset configuration tables and other important stuff on the database for things
to work as intended.

## Creating a new seeder

Once you have your tables set up and need to seed (or reset them) create a
new file that mirrors your table(s) domain and export one or more functions
that take in a `MutationCtx` object and any parameter you may need,

```ts
export const mySeeder = async (ctx: MutationCtx) => {
  // .. do your stuff
}
```

then import it in the root `seed.ts` mutation file in `convex` and add it
to the chain of functions, passing the context.

## Dedicated seeders

You can create a new seed mutation using an `internalMutation` to avoid exposing
the procedure to the clients and call it directly to only modify the relevant
part of the database.

## Calling the seeder

```bash
# to run the global seed
npx convex run seed

# running an individual custom seeder
npx convex run seed:<your-seed-mutation>
```
