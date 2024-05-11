# Query Toolkit

Query Toolkit is a set of TS definitions and tools for working with most common query scenarios.

## Ordering

Simple structure to represent ordering of a query.
It supports multiple fields and directions.

Example:

```ts

const ordering: Ordering = [{
  field: 'name',
  direction: 'ascending',
},
  {
    field: 'age',
    direction: 'descending',
  }];
```

];