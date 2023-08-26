import { prop } from "@typegoose/typegoose";
import { versionStringToVersionNumber } from "../../utils/version.js";

export interface ModelSchema {
	_id: string;
	_version: number;
}

export function ModelSchema<V extends string>(version: V) {
  const versionNumber = versionStringToVersionNumber(version);

  class Schema {
    @prop({
      type: () => String,
      required: true,
    })
    public _id!: string;

    @prop({
      type: () => Number,
      default: versionNumber,
      required: true,
    })
    public _version!: V extends "v0" ? 0 : number;
  }

  return Schema;
}
