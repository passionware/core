import { cf } from "@passionware/component-factory";

export const SelectOptionLoading = cf.div({
  className:
    "cursor-default select-none text-sm rounded animate-pulse min-w-[10rem] space-y-1",
  children: (
    <>
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded" />
      <span className="sr-only">Loading...</span>
    </>
  ),
});
