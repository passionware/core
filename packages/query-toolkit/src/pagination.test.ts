import { describe, expect, it } from 'vitest';
import pagination from './pagination';

describe('pagination', () => {
  describe('toCurrentPage', () => {
    it('should return 1 when currentOffset is 0 and pageLimit is 10', () => {
      expect(pagination.toPage(0, 10)).toEqual(1);
    });
    it('should return 1 when currentOffset is 1 and pageLimit is 10', () => {
      expect(pagination.toPage(1, 10)).toEqual(1);
    });
    it('should return 2 when currentOffset is 10 and pageLimit is 10', () => {
      expect(pagination.toPage(10, 10)).toEqual(2);
    });
    it('should return 1 when pageLimit is 0', () => {
      expect(pagination.toPage(10, 0)).toEqual(1);
    });
  });

  describe('toTotalPages', () => {
    it('should return 1 when totalItems is 0 and pageLimit is 10', () => {
      expect(pagination.toTotalPages(0, 10)).toEqual(1);
    });
    it('should return 1 when totalItems is 1 and pageLimit is 10', () => {
      expect(pagination.toTotalPages(1, 10)).toEqual(1);
    });
    it('should return 1 when totalItems is 10 and pageLimit is 10', () => {
      expect(pagination.toTotalPages(10, 10)).toEqual(1);
    });
    it('should return 2 when totalItems is 11 and pageLimit is 10', () => {
      expect(pagination.toTotalPages(11, 10)).toEqual(2);
    });
    it('should return 1 when pageLimit is 0', () => {
      expect(pagination.toTotalPages(10, 0)).toEqual(1);
    });
  });

  describe('toCurrentOffset', () => {
    it('should return 0 when currentPage is 1 and pageLimit is 10', () => {
      expect(pagination.toOffset(1, 10)).toEqual(0);
    });
    it('should return 10 when currentPage is 2 and pageLimit is 10', () => {
      expect(pagination.toOffset(2, 10)).toEqual(10);
    });
    it('should return 0 when pageLimit is 0', () => {
      expect(pagination.toOffset(2, 0)).toEqual(0);
    });
  });
});
