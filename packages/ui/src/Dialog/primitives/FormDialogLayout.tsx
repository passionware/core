import { ComponentType, ElementType, HTMLAttributes } from 'react';
import classNames from 'classnames';
import mergeProps from 'merge-props';
import { SkipWrapNode, wrap } from '@passionware/platform-react';

interface FormDialogLayoutProps<T extends ElementType>
  extends HTMLAttributes<T> {
  as?: T;
  closeSlot?: SkipWrapNode;
  navSlot?: SkipWrapNode;
  titleSlot?: SkipWrapNode;
  contentSlot?: SkipWrapNode;
  buttonsSlot?: SkipWrapNode;
}

export function FormDialogLayout<T extends ElementType = 'div'>({
  as,
  closeSlot,
  navSlot,
  titleSlot,
  contentSlot,
  buttonsSlot,
  ...rest
}: FormDialogLayoutProps<T>) {
  const Component = (as || 'div') as ComponentType<HTMLAttributes<T>>;

  return (
    <Component
      data-testid="FormDialogLayout"
      {...mergeProps(rest, {
        className: classNames(
          'relative bg-white dark:bg-gray-900 rounded-lg shadow-lg flex items-start flex-col max-w-min m-4 min-h-0',
          'dark:border dark:border-gray-800'
        ),
      })}
    >
      <div className="flex flex-row items-center bg-gray-100 dark:bg-gray-800 dark:border-b dark:border-b-gray-800 py-3 pl-4 pr-3 rounded-t-lg w-full">
        {wrap(navSlot, <div className="mr-3" />)}
        {wrap(
          titleSlot,
          <div className="text-md text-gray-700 dark:text-gray-300" />
        )}
        {wrap(closeSlot, <div className="ml-auto" />)}
      </div>

      {wrap(
        contentSlot,
        <div className="text-lg text-gray-700 dark:text-gray-200 min-w-[25rem] grow-1 overflow-y-auto p-4" />
      )}
      {wrap(buttonsSlot, <div className="flex gap-2 self-end min-w-max m-3" />)}
    </Component>
  );
}
