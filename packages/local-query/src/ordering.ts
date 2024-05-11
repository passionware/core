import type { Ordering } from '@passionware/query-toolkit';

export const sortObjects = <Field extends PropertyKey>(
  a: Record<Field, unknown>,
  b: Record<Field, unknown>,
  order: Ordering<Field>
) => {
  for (let i = 0; i < order.length; i += 1) {
    const orderItem = order[i];
    const aValue = a[orderItem.field];
    const bValue = b[orderItem.field];
    if (aValue !== bValue) {
      if (
        typeof aValue === typeof bValue ||
        (aValue === undefined) !== (bValue === undefined)
      ) {
        return (
          (bValue > aValue ? 1 : -1) *
          (orderItem.direction === 'descending' ? 1 : -1)
        );
      }
      throw new Error(`Cannot compare ${aValue} and ${bValue}`);
    }
  }
  return 0;
};
