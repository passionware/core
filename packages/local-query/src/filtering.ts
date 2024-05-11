import type { Filter } from '@passionware/query-toolkit';

export const filterObject = <Entity>(
  obj: Entity,
  filters: Filter<Entity>
): boolean =>
  Object.keys(filters).every((field) => {
    const filter = filters[field as keyof Filter<Entity>];
    const value = obj[field as keyof Entity];

    if (filter === undefined) {
      return true;
    }

    // booleans
    if ('equalTo' in filter && typeof filter.equalTo === 'boolean') {
      if (typeof value === 'boolean') {
        return value === filter.equalTo;
      }
      throw new Error(`Filtering error: field ${field} is not boolean`);
    }
    // strings
    if ('includes' in filter) {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(filter.includes.toLowerCase());
      }
      throw new Error(`Filtering error: field ${field} is not string`);
    }
    if ('equalTo' in filter && typeof filter.equalTo === 'string') {
      if (typeof value === 'string') {
        return value === filter.equalTo;
      }
      throw new Error(`Filtering error: field ${field} is not string`);
    }
    if ('oneOf' in filter) {
      if (typeof value === 'string') {
        return filter.oneOf.includes(value);
      }
      throw new Error(`Filtering error: field ${field} is not string`);
    }

    // arrays - oneToMany
    if ('hasOne' in filter) {
      if (Array.isArray(value)) {
        return value.includes(filter.hasOne);
      }
      throw new Error(`Filtering error: field ${field} is not array`);
    }

    // numbers

    if ('greaterThan' in filter) {
      if (typeof value === 'number') {
        return value > filter.greaterThan;
      }
      throw new Error(`Filtering error: field ${field} is not number`);
    }
    if ('lowerThan' in filter) {
      if (typeof value === 'number') {
        return value < filter.lowerThan;
      }
      throw new Error(`Filtering error: field ${field} is not number`);
    }
    if ('equalTo' in filter && typeof filter.equalTo === 'number') {
      if (typeof value === 'number') {
        return value === filter.equalTo;
      }
      throw new Error(`Filtering error: field ${field} is not number`);
    }
    return false;
  });
