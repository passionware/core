import { describe, expect, it } from 'vitest';
import { Filter } from '@passionware/query-toolkit';
import { filterObject } from './filtering';

describe('filtering', () => {
  it('should filter', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
    };
    const filters: Filter<typeof data> = {
      name: { includes: 'Jo' },
      age: { greaterThan: 18 },
      isStudent: { equalTo: true },
    };
    expect(filterObject(data, filters)).toBe(true);
  });

  it('should filter', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
    };
    const filters: Filter<typeof data> = {
      age: { lowerThan: 218 },
    };
    expect(filterObject(data, filters)).toBe(true);
  });

  it('should filter oneOf', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
    };
    const filters: Filter<typeof data> = {
      name: { oneOf: ['John', 'Mary'] },
    };
    expect(filterObject(data, filters)).toBe(true);
  });

  it('should filter oneOf - not matching', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
    };
    const filters: Filter<typeof data> = {
      name: { oneOf: ['Mary', 'Lucy'] },
    };
    expect(filterObject(data, filters)).toBe(false);
  });

  it('should not filter when no filters are present', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
    };
    const filters: Filter<typeof data> = {};
    expect(filterObject(data, filters)).toBe(true);
  });

  it('should filter hasOne', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
      hobbies: ['football', 'basketball'],
    };
    const filters: Filter<typeof data> = {
      hobbies: { hasOne: 'football' },
    };
    expect(filterObject(data, filters)).toBe(true);
  });
  it('should filter hasOne - not matching', () => {
    const data = {
      name: 'John',
      age: 20,
      isStudent: true,
      hobbies: ['football', 'basketball'],
    };
    const filters: Filter<typeof data> = {
      hobbies: { hasOne: 'ball' },
    };
    expect(filterObject(data, filters)).toBe(false);
  });
});
