import { SimpleStore } from "./simpleStore";
import { useSyncExternalStore } from "react";

/**
 * Creates a `SimpleSignal` instance that wraps a `SimpleStore`, allowing easy access
 * to the current store value and providing a hook to subscribe to updates.
 *
 * @template T - The type of the data held in the store.
 * @param store - The `SimpleStore` instance that holds the data.
 * @returns A `SimpleSignal` containing:
 * - `value`: a getter for the current value in the store.
 * - `useValue`: a React hook to subscribe to the store value updates.
 */
export function createSimpleSignal<T, M = undefined>(
  store: SimpleStore<T, M>,
): SimpleSignal<T> {
  return {
    get current() {
      return store.getCurrentValue();
    },
    useValue: () => {
      return useSyncExternalStore(
        store.addUpdateListener,
        store.getCurrentValue,
      );
    },
  };
}

export type SimpleSignal<T> = {
  get current(): T;
  useValue: () => T;
};
