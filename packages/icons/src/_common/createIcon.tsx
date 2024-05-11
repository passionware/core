import { SVGAttributes, SVGProps } from 'react';

type PathSpec = string | SVGAttributes<SVGPathElement>;

export default function createIcon(
  path: PathSpec | PathSpec[],
  svgAttributes?: SVGAttributes<SVGSVGElement>
) {
  const paths = Array.isArray(path) ? path : [path];
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 16 16"
        data-testid="icon"
        {...svgAttributes}
        {...props}
      >
        {paths.map((item, index) => {
          const pathProps = typeof item === 'string' ? { d: item } : item;

          return (
            <path
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              {...pathProps}
            />
          );
        })}
      </svg>
    );
  };
}

export function createOutlineIcon(
  path: PathSpec | PathSpec[],
  svgAttributes?: SVGAttributes<SVGSVGElement>
) {
  return createIcon(path, {
    fill: 'none',
    stroke: 'currentColor',
    ...svgAttributes,
  });
}

export function createSolidIcon(
  path: PathSpec | PathSpec[],
  svgAttributes?: SVGAttributes<SVGSVGElement>
) {
  return createIcon(path, {
    fill: 'currentColor',
    stroke: 'none',
    ...svgAttributes,
  });
}
