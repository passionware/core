import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const CheckmarkPrimitive = cf.div<{ checked?: boolean }>(
  {
    className: ({ checked, className }) =>
      classNames(
        "w-4 h-4 border rounded flex flex-row items-center justify-center",
        checked
          ? [
              "group-data-[active=true]/item:border-neutral-200 bg-brand-900 border-brand-900",
              "dark:group-data-[active=true]/item:border-neutral-800 dark:bg-brand-200 dark:border-brand-200",
            ]
          : [
              "group-data-[active=true]/item:border-brand-900 bg-white border-neutral-200",
              "dark:group-data-[active=true]/item:border-brand-200 dark:bg-gray-800 dark:border-brand-600",
            ],
        className,
      ),
    children: ({ checked }) =>
      checked ? (
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          className="text-white dark:text-gray-900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="icons/interface/tick" clipPath="url(#clip0_419_2310)">
            <path
              id="Vector"
              d="M1.2334 6.72754L4.05809 9.53334L10.7667 1.46667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_419_2310">
              <rect
                width="11"
                height="11"
                fill="currentColor"
                transform="translate(0.5)"
              />
            </clipPath>
          </defs>
        </svg>
      ) : null,
  },
  ["checked"],
);
