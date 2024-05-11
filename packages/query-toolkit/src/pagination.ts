const pagination = {
  toPage: (currentOffset: number, pageLimit: number) => {
    if (pageLimit === 0) return 1;
    return Math.max(1, Math.floor(currentOffset / pageLimit) + 1);
  },
  toTotalPages(totalItems: number, pageLimit: number) {
    if (pageLimit === 0 || totalItems === 0) return 1;
    return Math.ceil(totalItems / pageLimit);
  },
  toOffset(currentPage: number, pageLimit: number) {
    return (currentPage - 1) * pageLimit;
  },
};

export default pagination;
