import type { Model } from 'mongoose';
import type { IGlobalOptions } from '@typegeese/types';
import { Severity } from './constants';

/** Models Map */
export const models: Map<string, Model<any>> = new Map();
/** Constructors Map */
export const constructors: Map<string, NewableFunction> = new Map();
/** Global Options */
export const globalOptions: IGlobalOptions = {
  options: {
    allowMixed: Severity.WARN,
  },
};
