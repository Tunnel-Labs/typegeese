import type { ModelRef } from "~/types/refs.js";

export function useForeignRefs<Models>() {
  function foreignRef<T extends keyof Models>(
    model: T,
    foreignField: Models[T] extends ModelRef<infer M> ? keyof M : never,
    options: { required: boolean }
  ) {
    return {
      ref: model,
      type: () => String,
      ...options,
      __foreignField: foreignField,
    };
  }

  function virtualForeignRef<T extends keyof Models>(
    model: T,
    foreignField: Models[T] extends ModelRef<infer M> ? keyof M : never,
    localField: "_id"
  ) {
    return {
      ref: model,
      type: () => String,
      foreignField,
      localField,
    };
  }

  return {
    foreignRef,
    virtualForeignRef,
  };
}
