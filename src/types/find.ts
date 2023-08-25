// TODO: Improve this type
export type FindInput<Model> = {
  [K in keyof Model]: any;
};
