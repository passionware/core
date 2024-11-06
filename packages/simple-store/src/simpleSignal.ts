import { Maybe } from "@passionware/monads";
import { SimpleStore, SimpleStoreReadOnly } from "./simpleStore";
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

// Define a no-op fallback store outside the hook
const noopSubscribe = () => () => {};
const noopGetCurrentValue = () => undefined;

/**
 * Hook to use the current value of a `SimpleSignal`, with conditional
 * subscription using `useSyncExternalStore`. Ensures consistent hook usage
 * by always calling `useSyncExternalStore`, even if `signal` is null or undefined.
 *
 * @template T - The type of the data held in the signal.
 * @param store - A `SimpleStore` instance that may or may not exist.
 * be `null` or `undefined`.
 * @returns The current value of the signal, or `undefined` if no signal is present.
 */
export function useSimpleSignal<T>(
  store: Maybe<SimpleStoreReadOnly<T>>,
): T | undefined {
  return useSyncExternalStore(
    store ? store.addUpdateListener : noopSubscribe, // Use no-op subscribe if signal is absent
    store ? store.getCurrentValue : noopGetCurrentValue, // Use no-op getter if signal is absent
    noopGetCurrentValue, // Server-side rendering fallback
  );
}
export type SimpleSignal<T> = {
  get current(): T;
  useValue: () => T;
};
