import type { Schema } from "mongoose";

export function getVersionFromSchema(schema: Schema): number {
  const version = schema.paths._version?.options.default;

  if (version === undefined) {
    throw new Error(`Could not determine version from schema: ${schema}`);
  }

  return version;
}
