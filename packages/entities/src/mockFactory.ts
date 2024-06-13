import { isEqual } from "lodash";

export function createMockFactory<E extends { id: unknown } | {}>(
  factory: () => E,
  staticList: E[],
  seeder?: (seed: number) => void,
) {
  return {
    one: (seed?: number) => {
      seeder && seed && seeder(seed);
      return factory();
    },
    many: (count: number, seed?: number) => {
      seeder && seed && seeder(seed);
      return Array.from({ length: count }, () => factory());
    },
    static: {
      list: staticList,
      detail: (id: E extends { id: unknown } ? E["id"] : number) => {
        const isIdLike = staticList[0] && "id" in staticList[0];

        if (isIdLike) {
          const listWithIds = staticList as (E & { id: unknown })[];
          return listWithIds.find((x) => isEqual(x.id, id));
        }
        const index = id as number;
        return staticList[index];
      },
    },
  };
}

export function createMockFactoryGenericId<E, Id, StaticData extends E[]>(
  resolveId: (entity: E) => Id,
  factory: () => E,
  staticList: StaticData,
  seeder?: (seed: number) => void,
) {
  return {
    one: (seed?: number) => {
      seeder && seed && seeder(seed);
      return factory();
    },
    many: (count: number, seed?: number) => {
      seeder && seed && seeder(seed);
      return Array.from({ length: count }, () => factory());
    },
    static: {
      list: staticList,
      detail: (id: Id) => staticList.find((x) => isEqual(resolveId(x), id)),
    },
  };
}
