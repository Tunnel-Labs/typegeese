import { pre } from "@typegoose/typegoose";
import { Migrations } from "../types/migration.js";

export function defineMigration<PreviousModel, CurrentModel>(
  migrations: Migrations<PreviousModel, CurrentModel>
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- will be `null` for v0
  if (migrations === null) {
    return () => {
      /* noop */
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types -- Type of `ClassDecorator`
  return <TFunction extends Function>(schema: TFunction) => {
    // When reading an older model from the database, we need to set the newly added properties to their default values
    pre("validate", async function () {
      for (const [property, getProperty] of Object.entries(migrations)) {
        if ((this as any)[property] === undefined) {
          // eslint-disable-next-line no-await-in-loop -- We set properties one at a time to avoid race conditions
          (this as any)[property] = await getProperty(this);
        }
      }
    })(schema);

    return schema;
  };
}
