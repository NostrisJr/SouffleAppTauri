import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type DropDownMenuProps = {
  ports: string[];
  selectedPort: string;
  setSelectedPort: React.Dispatch<React.SetStateAction<string>>;
};

const DropDownMenu: React.FC<DropDownMenuProps> = ({
  ports,
  selectedPort,
  setSelectedPort,
}: DropDownMenuProps) => {
  const MenuItem: React.FC<{ label: string }> = ({ label }) => {
    const handleClick = () => {
      setSelectedPort(label);
    };
    return (
      <Menu.Item>
        <a
          className={classNames(
            "bg-gray-100 text-gray-900 block px-4 py-2 text-sm"
          )}
          onClick={handleClick}
        >
          {label}
        </a>
      </Menu.Item>
    );
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {selectedPort}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {ports.map((port, index) => port !== "" && <MenuItem label={port} key={index} />)}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export { DropDownMenu };
