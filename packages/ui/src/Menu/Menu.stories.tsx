import {
  ArchiveBoxIcon,
  FolderIcon,
  PencilIcon,
  PhotoIcon,
  SwatchIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { IconOptions } from "@passionware/icons";
import { ChevronRightIcon } from "@heroicons/react/24/solid/index";
import { Meta, StoryObj } from "@storybook/react";
import { Menu, MenuProps } from "./Menu";
import { MenuItem } from "./MenuItem";

// Adjust the import based on your file structure

const meta = {
  component: Menu,
  args: {
    textSlot: "Menu",
    children: (
      <>
        <MenuItem label="Undo" onClick={() => console.log("Undo")} />
        <MenuItem label="Redo" disabled />
        <MenuItem label="Cut" />
        <Menu textSlot="Copy as">
          <MenuItem label="Text" />
          <MenuItem label="Video" />
          <Menu textSlot="Image">
            <MenuItem label=".png" />
            <MenuItem label=".jpg" />
            <MenuItem label=".svg" />
            <MenuItem label=".gif" />
          </Menu>
          <MenuItem label="Audio" />
        </Menu>
        <Menu textSlot="Share">
          <MenuItem label="Mail" />
          <MenuItem label="Instagram" />
        </Menu>
      </>
    ),
  },
} satisfies Meta<MenuProps>;

export default meta;

export const Default: StoryObj<MenuProps> = {};

export const WithIcons: StoryObj<MenuProps> = {
  args: {
    colorVariant: "primary",
    styleVariant: "flat",
    textSlot: <IconOptions />,
    children: (
      <>
        <MenuItem leftSlot={<PencilIcon />} label="Edit User" />
        <MenuItem leftSlot={<ArchiveBoxIcon />} label="Archive User" />
        <Menu
          leftSlot={<TrashIcon />}
          colorVariant="danger"
          textSlot="Delete User"
        >
          <MenuItem label=".png" leftSlot={<PhotoIcon />} />
          <MenuItem label=".jpg" leftSlot={<PhotoIcon />} />
          <Menu textSlot="Image" leftSlot={<FolderIcon />}>
            <MenuItem label=".png" leftSlot={<PhotoIcon />} />
            <MenuItem label=".jpg" leftSlot={<PhotoIcon />} />
            <MenuItem label=".svg" leftSlot={<PhotoIcon />} />
            <MenuItem label=".gif" leftSlot={<PhotoIcon />} />
          </Menu>
          <MenuItem label=".gif" leftSlot={<PhotoIcon />} />
        </Menu>
      </>
    ),
  },
};

export const WithSelectedItem: StoryObj<MenuProps> = {
  args: {
    colorVariant: "primary",
    styleVariant: "flat",
    textSlot: <IconOptions />,
    children: (
      <>
        <MenuItem leftSlot={<PencilIcon />} label="Editor" />
        <MenuItem
          leftSlot={<ArchiveBoxIcon />}
          label="Archiver"
          aria-selected
        />
        <MenuItem leftSlot={<PhotoIcon />} label="Artist" />
      </>
    ),
  },
};

export const WithDescription: StoryObj<MenuProps> = {
  args: {
    colorVariant: "primary",
    styleVariant: "flat",
    textSlot: <IconOptions />,
    children: (
      <>
        {(
          ["primary", "danger", "warning", "success", "secondary"] as const
        ).map((colorVariant) => (
          <Menu
            key={colorVariant}
            leftSlot={<SwatchIcon />}
            textSlot={`See demo for ${colorVariant} variant`}
            colorVariant={colorVariant}
          >
            <MenuItem
              leftSlot={<PencilIcon />}
              label="Regular"
              descriptionSlot="Item with a description can take a lot of space"
              colorVariant={colorVariant}
            />
            <MenuItem
              leftSlot={<PencilIcon />}
              label="Selected"
              descriptionSlot="Item with a description can take a lot of space"
              aria-selected
              colorVariant={colorVariant}
            />
            <MenuItem
              leftSlot={<PencilIcon />}
              label="Twoliner"
              descriptionSlot={
                <>
                  <div>Item with a description</div>
                  <div>that may have two lines</div>
                </>
              }
              rightSlot={<ChevronRightIcon />}
              colorVariant={colorVariant}
            />
            <MenuItem
              leftSlot={<ArchiveBoxIcon />}
              label="Twoliner selected"
              aria-selected
              descriptionSlot={
                <>
                  <div>Item with a description</div>
                  <div> that may have two lines</div>
                </>
              }
              rightSlot={<ChevronRightIcon />}
              colorVariant={colorVariant}
            />
          </Menu>
        ))}
      </>
    ),
  },
};
