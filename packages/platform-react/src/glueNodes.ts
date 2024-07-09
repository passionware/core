import { cloneElement, ReactElement, ReactNode } from "react";

export function glueNodes(
  elements: ReactElement[],
  glueFn: (prev: ReactElement, next: ReactElement) => ReactElement,
): ReactNode {
  // hint: if element are [A, B, C] and glue is ()=>x, we want AxBxC

  const output: ReactElement[] = [];
  for (let i = 0; i < elements.length - 1; i++) {
    output.push(cloneElement(elements[i], { key: output.length }));
    output.push(
      cloneElement(glueFn(elements[i], elements[i + 1]), {
        key: output.length,
      }),
    );
  }
  output.push(
    cloneElement(elements[elements.length - 1], { key: output.length }),
  );
  return output;
}
