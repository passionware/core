import { ComponentType } from 'react';

export type ActionHandler = (name: string, ...values: any[]) => void;

type Actions = Record<string, (...values: never[]) => void>;
type PropsWithActions = { actions: Actions };
/**
 * Easy way to create a set of actions for debugging purposes.
 * It will replace all possible action in the object, with a bound logger action you provide, dynamically
 * @param actionHandler a function that will be called with the action name and the value passed to the action
 * @param customActions an object with custom actions that will be merged with the default actions
 */
export const makeDebugActions = <T extends Actions>(
  actionHandler: ActionHandler,
  customActions?: NoInfer<Partial<T>>
): T =>
  new Proxy<T>({} as T, {
    get(_, p) {
      if (customActions && p in customActions) {
        return customActions[p as keyof typeof customActions];
      }
      return actionHandler.bind(null, p.toString());
    },
  });

export type PropsWithActionHandler = {
  onAction: ActionHandler;
};
export type ReplaceActionsWithActionHandler<T extends PropsWithActions> = Omit<T, 'actions'> &
  PropsWithActionHandler;

/**
 * Converts a component that has actions, to a component that has an onAction handler
 * This is useful, when you want to bind the actions to storybook args actions which can be defined only as root callbacks
 * @param Component
 */
export function replaceActionsWithActionHandler<T extends PropsWithActions>(
  Component: ComponentType<T>
): ComponentType<ReplaceActionsWithActionHandler<T>> {
  return function (props: ReplaceActionsWithActionHandler<T>) {
    const { onAction, ...rest } = props;
    return <Component {...(rest as unknown as T)} actions={makeDebugActions(onAction)} />;
  };
}
