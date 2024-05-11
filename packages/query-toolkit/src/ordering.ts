export type Ordering<Field> = {
  field: Field;
  direction: 'ascending' | 'descending';
}[];
export const toggleOrdering = <Fields>(
  ordering: Ordering<Fields>,
  field: Fields
) => {
  const currentOrdering = ordering.find((item) => item.field === field);

  const newDirection =
    currentOrdering?.direction === 'ascending' ? 'descending' : 'ascending';
  return [
    { field, direction: newDirection } as const,
    ...ordering.filter((item) => item.field !== field),
  ];
};
export const getOrderingDirection = <Fields>(
  ordering: Ordering<Fields>,
  field: Fields
) => {
  const currentOrdering = ordering.find((item) => item.field === field);
  if (currentOrdering) {
    return currentOrdering.direction;
  }
  return undefined;
};
