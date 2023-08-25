import type { Deprecated } from "../types/deprecated.js";

export function deprecated<T>(value: T) {
  return value as Deprecated<T>;
}
