export type BooleanFilter = { equalTo: boolean };
export type StringOneOfFilter = { oneOf: string[] };
export type StringEqualToFilter = { equalTo: string };
export type StringIncludesFilter = { includes: string };
export type StringFilter =
  | StringIncludesFilter
  | StringEqualToFilter
  | StringOneOfFilter;
export type NumberFilter =
  | { greaterThan: number }
  | { lowerThan: number }
  | { equalTo: number };
export type ConditionalType<
  Entity,
  Field extends keyof Entity,
  DesiredType,
  DesiredFilter
> = Entity[Field] extends DesiredType ? DesiredFilter : never;
export type Filter<Entity> = {
  [field in keyof Entity]?:
    | ConditionalType<Entity, field, boolean, BooleanFilter>
    | ConditionalType<Entity, field, string, StringFilter>
    | ConditionalType<Entity, field, number, NumberFilter>
    | (Entity[field] extends (infer Value)[] ? OneToManyFilter<Value> : never);
};
export type LookupFilter<Value> = {
  equalTo: Value;
};

export type OneToManyFilter<Value> = {
  hasOne: Value;
};
