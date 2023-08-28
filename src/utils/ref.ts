import type { ForeignRef, VirtualForeignRef } from "~/types/refs.js";

export function useForeignRefs<Schemas>() {
  function foreignRef<T extends keyof Schemas>(
    model: T,
    foreignField: keyof {
      [Field in keyof InstanceType<
        // @ts-expect-error: Works
        Schemas[T]
      > as InstanceType<
        // @ts-expect-error: Works
        Schemas[T]
      >[Field] extends
        | ForeignRef<infer M, any, any>
        | ForeignRef<infer M, any, any>[]
        | VirtualForeignRef<infer M, any, any>
        | VirtualForeignRef<infer M, any, any>[]
        ? Field
        : never]: true;
    },
    options: { required: boolean }
  ) {
    return {
      ref: model,
      type: () => String,
      ...options,
      __foreignField: foreignField,
    };
  }

  function virtualForeignRef<T extends keyof Schemas>(
    model: T,
    foreignField: keyof {
      [Field in keyof InstanceType<
        // @ts-expect-error: Works
        Schemas[T]
      > as InstanceType<
        // @ts-expect-error: Works
        Schemas[T]
      >[Field] extends
        | ForeignRef<infer M, any, any>
        | ForeignRef<infer M, any, any>[]
        ? Field
        : never]: true;
    },
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
