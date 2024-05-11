import {
  IconAdd,
  IconChevronDown,
  IconDribble,
  IconPulse,
  IconTicket,
} from "@passionware/icons";
import { Battery100Icon } from "@heroicons/react/16/solid";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Meta, StoryObj } from "@storybook/react";
import classNames from "classnames";
import { Fragment } from "react";
import {
  AnchorButton as StoryAnchorButton,
  AnchorButtonProps,
} from "./AnchorButton";
import { Button, ButtonProps } from "./Button";
import styles from "./Button.stories.module.scss";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  component: Button,
  args: {
    children: "Button",
    colorVariant: "primary",
    styleVariant: "solid",
    sizeVariant: "md",
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<ButtonProps>;

export default meta;

export const Gallery: StoryObj<ButtonProps> = {
  render: () => (
    <div className="@container">
      <div className="text-md text-gray-500 px-4 pt-4">Normal background</div>
      <div
        className={classNames(
          "grid grid-cols-4 @[60rem]:grid-cols-8 gap-4 place-items-start p-4 text-gray-700 dark:text-gray-300",
        )}
      >
        <div className="col-span-4">Solid</div>
        <div className="col-span-4">Flat</div>
        <div className="col-span-4">Ghost</div>
        <div className="col-span-4">Outline</div>
        {(
          [
            "primary",
            "secondary",
            "danger",
            "success",
            "warning",
          ] as const
        ).map((colorVariant) =>
          (["solid", "flat", "ghost", "outline"] as const).map((styleVariant) =>
            (["md", "sm"] as const).map((sizeVariant) => (
              <Fragment key={`${colorVariant}-${styleVariant}-${sizeVariant}`}>
                <Button
                  key={`${colorVariant}-${styleVariant}-${sizeVariant}`}
                  colorVariant={colorVariant}
                  styleVariant={styleVariant}
                  sizeVariant={sizeVariant}
                  leftSlot={<IconAdd />} // Replace with your actual icon
                  rightSlot={<ChevronUpDownIcon />} // Replace with your actual icon<ChevronUpDownIcon />
                >
                  Label
                </Button>
                <Button
                  key={`${colorVariant}-${styleVariant}-${sizeVariant}-icon-only`}
                  colorVariant={colorVariant}
                  styleVariant={styleVariant}
                  sizeVariant={sizeVariant}
                >
                  <ChevronUpDownIcon />
                </Button>
              </Fragment>
            )),
          ),
        )}
      </div>
      <div className="text-md text-gray-500 p-4">Colorful background</div>
      <div
        className={classNames(
          "grid grid-cols-4 @[60rem]:grid-cols-8 gap-4 place-items-start p-4",
          styles.backgroundAnimate,
        )}
      >
        <div className="col-span-4">Solid</div>
        <div className="col-span-4">Flat</div>
        <div className="col-span-4">Ghost</div>
        <div className="col-span-4">Outline</div>
        {(
          [
            "primary",
            "secondary",
            "danger",
            "success",
            "warning",
          ] as const
        ).map((colorVariant) =>
          (["solid", "flat", "ghost", "outline"] as const).map((styleVariant) =>
            (["md", "sm"] as const).map((sizeVariant) => (
              <Fragment key={`${colorVariant}-${styleVariant}-${sizeVariant}`}>
                <Button
                  key={`${colorVariant}-${styleVariant}-${sizeVariant}`}
                  colorVariant={colorVariant}
                  styleVariant={styleVariant}
                  sizeVariant={sizeVariant}
                  leftSlot={<IconAdd />} // Replace with your actual icon
                  rightSlot={<IconChevronDown />} // Replace with your actual icon
                >
                  Label
                </Button>
                <Button
                  key={`${colorVariant}-${styleVariant}-${sizeVariant}-icon-only`}
                  colorVariant={colorVariant}
                  styleVariant={styleVariant}
                  sizeVariant={sizeVariant}
                >
                  <IconAdd />
                </Button>
              </Fragment>
            )),
          ),
        )}
      </div>
    </div>
  ),
};

export const AnchorButton: StoryObj<AnchorButtonProps> = {
  render: () => (
    <div className="p-4 w-80">
      <StoryAnchorButton href="https://google.com" target="_blank">
        This is an anchor button
      </StoryAnchorButton>
    </div>
  ),
};

export const InsideButtonGroup = {
  render: (props) => (
    <div className={"space-y-md"}>
      <ButtonGroup>
        <Button {...props}>First button</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button {...props}>
          <IconTicket />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button {...props}>First button</Button>
        <Button {...props}>Second button</Button>
      </ButtonGroup>{" "}
      <ButtonGroup>
        <Button {...props}>
          <IconDribble />
        </Button>
        <Button {...props}>
          <IconPulse />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button {...props}>First button</Button>
        <Button {...props} colorVariant="primary">
          Second button
        </Button>
        <Button {...props}>Third button</Button>
        <Button {...props}>Last button</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button {...props}>
          <Battery100Icon />
        </Button>
        <Button {...props}>
          <IconAdd />
        </Button>
        <Button {...props}>
          <IconChevronDown />
        </Button>
        <Button {...props}>
          <IconTicket />
        </Button>
      </ButtonGroup>
    </div>
  ),
  args: {
    styleVariant: "outline",
    colorVariant: "secondary",
  },
  parameters: {
    layout: "centered",
  },
} satisfies StoryObj<ButtonProps>;

export const InsideButtonGroup2 = {
  ...InsideButtonGroup,
  args: {
    styleVariant: "solid",
    colorVariant: "secondary",
  },
} satisfies StoryObj<ButtonProps>;

export const InsideButtonGroup3 = {
  ...InsideButtonGroup,
  args: {
    styleVariant: "solid",
    colorVariant: "primary",
  },
} satisfies StoryObj<ButtonProps>;
