export interface PopulateObject {
  path: string;
  select?: Record<string, number>;
  populate?: Array<PopulateObject>;
}
