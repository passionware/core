import { ReactNode } from "react";

export interface PopoverLayoutProps {
  searchSlot?: ReactNode;
  children: ReactNode;
  footerSlot?: ReactNode;
}

export function PopoverLayout({
  searchSlot,
  children,
  footerSlot,
}: PopoverLayoutProps) {
  return (
    <>
      {searchSlot && (
        <div className="m-sm mb-0 flex flex-row gap-sm items-center">
          {searchSlot}
        </div>
      )}
      <div className="p-sm space-y-sm mb-auto">{children}</div>
      {footerSlot && (
        <div className="border-t border-border-muted-default dark:border-gray-700 first-child-rounded-top-none">
          {footerSlot}
        </div>
      )}
    </>
  );
}
