import { SetStateAction } from 'react';
import {
  SimpleEventEmitter,
  SimpleEventSubscribe,
  createSimpleEvent,
} from '@passionware/simple-event';

export interface SimpleStore<Data, ChangeMeta = undefined> {
  addUpdateListener: SimpleEventSubscribe<Data, ChangeMeta>;
  setNewValue: SimpleEventEmitter<SetStateAction<Data>, ChangeMeta>;
  getCurrentValue: () => Data;
}

export const createSimpleStore = <T, ChangeMeta = undefined>(
  initialValue: T
): SimpleStore<T, ChangeMeta> => {
  let lastValue: T = initialValue;

  const simpleEvent = createSimpleEvent<T, ChangeMeta>();
  const emit = (value: SetStateAction<T>, metadata: ChangeMeta) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prevState: T) => T)(lastValue)
        : value;
    lastValue = newValue;
    simpleEvent.emit(newValue, metadata);
  };
  return {
    // again, casting since we can't check ChangeMeta being undefined in runtime outside emit call
    setNewValue: emit as SimpleEventEmitter<SetStateAction<T>, ChangeMeta>,
    getCurrentValue: () => lastValue,
    addUpdateListener: simpleEvent.addListener,
  };
};
