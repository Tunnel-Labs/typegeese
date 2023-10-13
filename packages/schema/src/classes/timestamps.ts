import { modelOptions } from "../utils/model-options.js";

/**
	This class can be used for already existing type information for the Timestamps
*/
@modelOptions({ schemaOptions: { timestamps: true } })
export abstract class TimeStamps {
  public createdAt?: Date;
  public updatedAt?: Date;
}