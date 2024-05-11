# Simple store

Simple Store is a lightweight state hook that which functions similarly to the React's useState() hook but enables data
sharing between instances created using the same factory.

Simple Store is particularly useful for test and Storybook code. It allows you to expose mock hook implementations
within a factory, enabling data sharing without the need for specialized contexts.

## Usage

```jsx
const createMockItemsDomain = (initialData) => {

  const itemsStore = createSimpleStore(initialData);

  return {
    useAddItem: () => {
      const [value, setValue] = itemsStore.useValue();
      return (item) => {
        itemsStore.setValue([...value, item]);
      };
    },
    useItems: () => {
      const [value, setValue] = itemsStore.useValue();
      return value;
    },
  };
};

```