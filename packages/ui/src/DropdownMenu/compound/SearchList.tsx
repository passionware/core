import { ReactNode } from "react";
import { useDropdownMenuInternalContext } from "../DropdownMenu.context";

export interface SearchListProps<T> {
  useOptions: (query: string) => T;
  children: (value: T, query: string) => ReactNode;
}
/**
 * Conventional way to render a list of options based on a search query.
 */
export function SearchList<T>(props: SearchListProps<T>) {
  const internal = useDropdownMenuInternalContext();
  const options = props.useOptions(internal.query);

  return props.children(options, internal.query);
}
