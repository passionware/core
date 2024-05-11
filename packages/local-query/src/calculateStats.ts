import { type Filter } from "@passionware/query-toolkit";
import { filterObject } from "./filtering";

export const calculateStats = <T extends { isArchived: boolean }>(
  entities: readonly T[],
  filters: Filter<unknown>,
) => {
  const filteredItems = entities.filter((value) =>
    filterObject(value, filters),
  );
  return {
    filtered: {
      totalCount: filteredItems.length,
      archivedCount: filteredItems.filter((item) => item.isArchived).length,
    },
    unfiltered: {
      totalCount: entities.length,
      archivedCount: entities.filter((item) => item.isArchived).length,
    },
  };
};

export const calculateSimpleStats = <T>(
  entities: readonly T[],
  filters: Filter<unknown>,
) => {
  const filteredItems = entities.filter((value) =>
    filterObject(value, filters),
  );
  return {
    filtered: {
      totalCount: filteredItems.length,
    },
    unfiltered: {
      totalCount: entities.length,
    },
  };
};
