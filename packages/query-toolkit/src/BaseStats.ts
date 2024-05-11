export interface BaseStats {
  filtered: {
    totalCount: number;
    // archivedCount: number;
  };
  unfiltered: {
    totalCount: number;
    // archivedCount: number;
  };
}

export interface ArchivedBaseStats {
  filtered: {
    totalCount: number;
    archivedCount: number;
  };
  unfiltered: {
    totalCount: number;
    archivedCount: number;
  };
}
