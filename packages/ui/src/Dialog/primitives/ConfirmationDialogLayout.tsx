import { HTMLAttributes } from 'react';
import mergeProps from 'merge-props';
import { SkipWrapNode, wrap } from '@passionware/platform-react';

export interface ConfirmationDialogLayoutProps
  extends HTMLAttributes<HTMLDivElement> {
  closeSlot?: SkipWrapNode;
  iconSlot?: SkipWrapNode;
  titleSlot?: SkipWrapNode;
  descriptionSlot?: SkipWrapNode;
  buttonsSlot?: SkipWrapNode;
}

export function ConfirmationDialogLayout({
  closeSlot,
  iconSlot,
  titleSlot,
  descriptionSlot,
  buttonsSlot,
  ...rest
}: ConfirmationDialogLayoutProps) {
  return (
    <div
      {...mergeProps(rest, {
        className:
          'relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-start flex-col gap-4 max-w-min',
      })}
    >
      {wrap(closeSlot, <div className="absolute right-2 top-2" />)}
      {wrap(
        iconSlot,
        <div className="flex justify-center [&>svg]:h-11 [&>svg]:w-11" />
      )}
      {wrap(
        titleSlot,
        <div className="text-2xl text-gray-700 dark:text-gray-200" />
      )}
      {wrap(
        descriptionSlot,
        <div className="text-lg text-gray-700 dark:text-gray-200 min-w-[20rem]" />
      )}
      {wrap(
        buttonsSlot,
        <div className="flex gap-2 self-end min-w-max mt-2" />
      )}
    </div>
  );
}
