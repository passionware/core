import { Maybe } from "@passionware/monads";
import { useEffect, useRef } from "react";

export type SimpleEventListener<E, Metadata = undefined> = [Metadata] extends [
  undefined,
]
  ? (e: E) => void
  : (e: E, metadata: Metadata) => void;

export type SimpleEventSubscribe<E, Metadata = undefined> = (
  listener: SimpleEventListener<E, Metadata>,
) => /* unsubscribe */ () => void;

// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
export type SimpleEventEmitter<E, Metadata> = [Metadata] extends [undefined]
  ? (e: E) => void
  : (e: E, metadata: Metadata) => void;

export interface SimpleEvent<E = void, Metadata = undefined> {
  addListener: SimpleEventSubscribe<E, Metadata>;
  emit: SimpleEventEmitter<E, Metadata>;
  waitFor<T extends E>(predicate: (e: E) => e is T): Promise<T>;
  waitFor(predicate: (e: E) => boolean): Promise<E>;
  map<T>(mapper: (e: E) => T): SimpleEvent<T, Metadata>;
  filter(predicate: (e: E) => boolean): SimpleEvent<E, Metadata>;
  filter<T extends E>(predicate: (e: E) => e is T): SimpleEvent<T, Metadata>;
}

export type SimpleReadOnlyEvent<E = void, Metadata = undefined> = Omit<
  SimpleEvent<E, Metadata>,
  "emit"
>;

export type InspectableEvent<E = void, Metadata = undefined> = SimpleEvent<
  E,
  Metadata
> & {
  getListeners: () => SimpleEventListener<E, Metadata>[];
};

export const createSimpleEvent = <
  E = void,
  Metadata = undefined,
>(): SimpleEvent<E, Metadata> => {
  const { getListeners, ...inspectableEvent } = createInspectableEvent<
    E,
    Metadata
  >();
  return inspectableEvent;
};

export const createInspectableEvent = <
  E = void,
  Metadata = undefined,
>(): InspectableEvent<E, Metadata> => {
  type Listener = SimpleEventListener<E, Metadata>;
  const listeners: Listener[] = [];
  const addListener = (listener: Listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };
  const emit = (value: E, metadata: Metadata) => {
    [...listeners].forEach((listener) => {
      listener(value, metadata);
    });
  };
  return {
    addListener,
    emit: emit as SimpleEventEmitter<E, Metadata>, // casting since we can't check Metadata being undefined in runtime outside emit call
    getListeners: () => listeners,
    waitFor(predicate: { (e: E): boolean }): Promise<E> {
      return new Promise((resolve) => {
        const listener = (e: E) => {
          if (predicate(e)) {
            resolve(e);
          }
        };
        addListener(listener);
      });
    },
    map: <T>(mapper: (e: E) => T) => {
      const newEvent = createSimpleEvent<T, Metadata>();
      addListener((...args: any[]) => {
        newEvent.emit(mapper(args[0]), args[1]);
      });
      return newEvent;
    },
    filter: <T extends E>(predicate: (e: E) => e is T) => {
      const newEvent = createSimpleEvent<T, Metadata>();
      addListener((...args: any[]) => {
        if (predicate(args[0])) {
          newEvent.emit(args[0], args[1]);
        }
      });
      return newEvent;
    },
  };
};

export const useSimpleEventSubscription = <E, Metadata>(
  subscribe: Maybe<SimpleEventSubscribe<E, Metadata>>,
  listener: SimpleEventListener<E, Metadata>,
) => {
  const lastListener = useRef(listener);
  lastListener.current = listener;

  useEffect(() => {
    if (!subscribe) return;

    const listener = ((e, metadata) => {
      lastListener.current(e, metadata);
    }) as SimpleEventListener<E, Metadata>;

    const unsubscribe = subscribe(listener);
    return () => unsubscribe();
  }, [subscribe]);
};

/**
 * Convenient way to create a mechanism that can subscribe to one event emitter at a time.
 */
export const createSwitchingSubscriber = () => {
  let unsubscribe: (() => void) | undefined;
  return {
    switchTo: <E, Metadata>(
      subscribe: SimpleEventSubscribe<E, Metadata>,
      listener: SimpleEventListener<E, Metadata>,
    ) => {
      unsubscribe?.();
      unsubscribe = subscribe(listener);
    },
    unsubscribe: () => {
      unsubscribe?.();
      unsubscribe = undefined;
    },
  };
};
