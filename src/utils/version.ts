import type { Schema } from "mongoose";

export function versionStringToVersionNumber(versionString: string): number {
  const versionNumberString = versionString.split("-")[0]?.slice(1);

  if (versionNumberString === undefined) {
    throw new Error(
      `Failed to convert version string "${versionString}" to number`
    );
  }

  const versionNumber = Number(versionNumberString);

  if (Number.isNaN(versionNumber)) {
    throw new Error(`Invalid version number: ${versionNumberString}`);
  }

  return versionNumber;
}

export function getVersionFromSchema(schema: Schema): number {
  const version = schema.paths._version?.options.default;

  if (version === undefined) {
    throw new Error(`Could not determine version from schema: ${schema}`);
  }

  return version;
}