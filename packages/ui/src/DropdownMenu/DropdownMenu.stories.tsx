import { IconChat, IconPulse, IconWand } from "@passionware/icons";
import { rd } from "@passionware/monads";
import { mapTestQuery, useTestQuery } from "@passionware/platform-storybook";
import { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { OptionsLayout } from "../_common";
import { Button } from "../Button";
import { DropdownMenu, DropdownMenuProps } from "./DropdownMenu";
import { CheckmarkPrimitive } from "./primitives/CheckmarkPrimitive";
import {
  ItemPrimitive,
  ItemPrimitiveIcon,
  ItemSecondaryText,
} from "./primitives/ItemPrimitive";
import { PopoverLayout } from "./primitives/PopoverLayout";
import { PopoverPrimitive } from "./primitives/PopoverPrimitive";
import { RadioButtonPrimitive } from "./primitives/RadioButtonPrimitive";
import { SearchPrimitive } from "./primitives/SearchPrimitive";

const meta = {
  component: DropdownMenu,
} satisfies Meta<DropdownMenuProps>;

export default meta;

type Story = StoryObj<DropdownMenuProps>;

export const Default = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <PopoverLayout
              searchSlot={
                <DropdownMenu.Search>
                  <SearchPrimitive type="text" placeholder="search this" />
                </DropdownMenu.Search>
              }
              footerSlot={
                <DropdownMenu.Item
                  label="Item 3"
                  onClick={() => {
                    console.log("CREATE!!");
                  }}
                >
                  <ItemPrimitive>Add more data</ItemPrimitive>
                </DropdownMenu.Item>
              }
            >
              <DropdownMenu.Item label="Item 1">
                <ItemPrimitive>Item 1</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 2">
                <ItemPrimitive>Item 2</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 3">
                <ItemPrimitive colorVariant="danger">Item 3</ItemPrimitive>
              </DropdownMenu.Item>
            </PopoverLayout>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

export const ComplexExample = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <PopoverLayout
              searchSlot={
                <DropdownMenu.Search>
                  <SearchPrimitive type="text" placeholder="search this" />
                </DropdownMenu.Search>
              }
              footerSlot={
                <DropdownMenu.Item
                  label="Item 3"
                  onClick={() => {
                    console.log("CREATE!!");
                  }}
                >
                  <ItemPrimitive>Add more data</ItemPrimitive>
                </DropdownMenu.Item>
              }
            >
              <DropdownMenu.Item label="Item 1">
                <ItemPrimitive>
                  <ItemPrimitiveIcon>
                    <IconChat />
                  </ItemPrimitiveIcon>
                  <div>Item 1</div>
                  <ItemSecondaryText>Secondary text</ItemSecondaryText>
                </ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 2" disabled>
                <ItemPrimitive>
                  <ItemPrimitiveIcon>
                    <IconPulse />
                  </ItemPrimitiveIcon>
                  <div>Item 2 (disabled)</div>
                  <ItemSecondaryText>Secondary text</ItemSecondaryText>
                </ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 3">
                <ItemPrimitive>
                  <ItemPrimitiveIcon>
                    <IconPulse />
                  </ItemPrimitiveIcon>
                  Item 3
                </ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 4">
                <ItemPrimitive colorVariant="danger">
                  <ItemPrimitiveIcon>
                    <IconWand />
                  </ItemPrimitiveIcon>
                  Item 4
                </ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 5" disabled>
                <ItemPrimitive colorVariant="danger">
                  <ItemPrimitiveIcon>
                    <IconChat />
                  </ItemPrimitiveIcon>
                  Item 5 (disabled)
                </ItemPrimitive>
              </DropdownMenu.Item>
            </PopoverLayout>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

export const NoSearch = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <PopoverLayout>
              <DropdownMenu.Item label="Item 1">
                <ItemPrimitive>Item 1</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 2">
                <ItemPrimitive>Item 2</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 3">
                <ItemPrimitive>Item 3</ItemPrimitive>
              </DropdownMenu.Item>
            </PopoverLayout>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

export const PreselectedItem = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <PopoverLayout>
              <DropdownMenu.Item label="Item 1">
                <ItemPrimitive>Item 1</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item setActiveOnRender label="Item 2">
                <ItemPrimitive>Item 2</ItemPrimitive>
              </DropdownMenu.Item>
              <DropdownMenu.Item label="Item 3">
                <ItemPrimitive>Item 3</ItemPrimitive>
              </DropdownMenu.Item>
            </PopoverLayout>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

const options = [
  "Venice",
  "Venus",
  "Mars",
  "Earth",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

const useOptions = (query: string) => {
  return rd.useLastWithPlaceholder(
    useTestQuery(
      useMemo(
        () =>
          mapTestQuery({ data: options, delay: 300 }, (x) =>
            x.filter((option) =>
              option.toLowerCase().includes(query?.toLowerCase() || ""),
            ),
          ),
        [query],
      ),
    ),
  );
};

export const WithUseOptions = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <DropdownMenu.SearchList useOptions={useOptions}>
              {(options, query) => (
                <PopoverLayout
                  searchSlot={
                    <DropdownMenu.Search>
                      <SearchPrimitive type="text" placeholder="search this" />
                    </DropdownMenu.Search>
                  }
                  footerSlot={
                    <DropdownMenu.Item
                      label="Item 3"
                      onClick={() => {
                        console.log("CREATE!!");
                      }}
                    >
                      <ItemPrimitive>Add {query}</ItemPrimitive>
                    </DropdownMenu.Item>
                  }
                >
                  <OptionsLayout
                    optionsState={options}
                    renderOptions={(options) =>
                      options.map((option) => (
                        <DropdownMenu.Item key={option} label={option}>
                          <ItemPrimitive>{option}</ItemPrimitive>
                        </DropdownMenu.Item>
                      ))
                    }
                  />
                </PopoverLayout>
              )}
            </DropdownMenu.SearchList>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

export const WithUseOptionsAndPreselected = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <DropdownMenu.SearchList useOptions={useOptions}>
              {(options, query) => (
                <PopoverLayout
                  searchSlot={
                    <DropdownMenu.Search>
                      <SearchPrimitive type="text" placeholder="search this" />
                    </DropdownMenu.Search>
                  }
                  footerSlot={
                    <DropdownMenu.Item
                      label="Item 3"
                      onClick={() => {
                        console.log("CREATE!!");
                      }}
                    >
                      <ItemPrimitive>Add {query}</ItemPrimitive>
                    </DropdownMenu.Item>
                  }
                >
                  <OptionsLayout
                    optionsState={options}
                    renderOptions={(options) =>
                      options.map((option) => (
                        <DropdownMenu.Item
                          key={option}
                          label={option}
                          setActiveOnRender={option === "Earth"}
                        >
                          <ItemPrimitive>{option}</ItemPrimitive>
                        </DropdownMenu.Item>
                      ))
                    }
                  />
                </PopoverLayout>
              )}
            </DropdownMenu.SearchList>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

export const WithCheckboxes = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <DropdownMenu.SearchList useOptions={useOptions}>
              {(options, query) => (
                <PopoverLayout
                  searchSlot={
                    <DropdownMenu.Search>
                      <SearchPrimitive type="text" placeholder="search this" />
                    </DropdownMenu.Search>
                  }
                  footerSlot={
                    <DropdownMenu.Item
                      label="Item 3"
                      onClick={() => {
                        console.log("CREATE!!");
                      }}
                    >
                      <ItemPrimitive>Add {query}</ItemPrimitive>
                    </DropdownMenu.Item>
                  }
                >
                  <OptionsLayout
                    optionsState={options}
                    renderOptions={(options) =>
                      options.map((option) => (
                        <CheckboxOption
                          key={option}
                          option={option}
                          setActiveOnRender={option === "Earth"}
                        />
                      ))
                    }
                  />
                </PopoverLayout>
              )}
            </DropdownMenu.SearchList>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

function CheckboxOption({
  option,
  setActiveOnRender,
}: {
  option: string;
  setActiveOnRender?: boolean;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <DropdownMenu.Item
      key={option}
      label={option}
      setActiveOnRender={setActiveOnRender}
      closeOnSelect={false}
      onClick={() => setChecked((x) => !x)}
    >
      <ItemPrimitive>
        <CheckmarkPrimitive checked={checked} />
        {option}
      </ItemPrimitive>
    </DropdownMenu.Item>
  );
}

export const WithRadioButtons = {
  args: {
    children: (
      <>
        <DropdownMenu.Trigger>
          <Button>Open Dropdown</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Popover>
          <PopoverPrimitive>
            <DropdownMenu.SearchList useOptions={useOptions}>
              {(options, query) => (
                <PopoverLayout
                  searchSlot={
                    <DropdownMenu.Search>
                      <SearchPrimitive type="text" placeholder="search this" />
                    </DropdownMenu.Search>
                  }
                  footerSlot={
                    <DropdownMenu.Item
                      label="Item 3"
                      onClick={() => {
                        console.log("CREATE!!");
                      }}
                    >
                      <ItemPrimitive>Add {query}</ItemPrimitive>
                    </DropdownMenu.Item>
                  }
                >
                  <OptionsLayout
                    optionsState={options}
                    renderOptions={(options) =>
                      options.map((option) => (
                        <RadioButtonOption
                          key={option}
                          option={option}
                          setActiveOnRender={option === "Earth"}
                        />
                      ))
                    }
                  />
                </PopoverLayout>
              )}
            </DropdownMenu.SearchList>
          </PopoverPrimitive>
        </DropdownMenu.Popover>
      </>
    ),
  },
} satisfies Story;

function RadioButtonOption({
  option,
  setActiveOnRender,
}: {
  option: string;
  setActiveOnRender?: boolean;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <DropdownMenu.Item
      key={option}
      label={option}
      setActiveOnRender={setActiveOnRender}
      closeOnSelect={false}
      onClick={() => setChecked(true)}
    >
      <ItemPrimitive>
        <RadioButtonPrimitive checked={checked} />
        {option}
      </ItemPrimitive>
    </DropdownMenu.Item>
  );
}
