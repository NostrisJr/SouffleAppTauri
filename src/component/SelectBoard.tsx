import React, { useState } from "react";

type selectPortProps = {
  boards: Array<Array<string>>;
  selectedDevice: Array<string>;
  setSelectedDevice: React.Dispatch<React.SetStateAction<Array<string>>>;
  debuggingMode: boolean;
};

type portItemProps = {
  device: Array<string>;
  handleClick: (device: Array<string>) => void;
  debuggingMode: boolean;
};

function PortItem({ device, handleClick, debuggingMode }: portItemProps) {
  return (
    <li className="">
      <button
        className="p-2 flex text-s-white w-full hover:text-s-purple text-left align-middle h-max overflow-hidden text-ellipsis whitespace-nowrap"
        onClick={() => handleClick(device)}
      >
        {debuggingMode === false ? device[1] : device[0]}
      </button>
    </li>
  );
}

function SelectBoard({
  boards,
  selectedDevice,
  setSelectedDevice,
  debuggingMode,
}: selectPortProps) {
  const [clicked, setClicked] = useState(false);

  async function openMenu() {
    setClicked(true);
  }

  function handleClick(device: Array<string>) {
    setSelectedDevice(device);
    setClicked(false);
  }

  return (
    <div className="relative z-0 p-2" onMouseLeave={() => setClicked(false)}>
      <button
        className="text-s-purple font-body text-lg flex justify-start gap-4 items-baseline"
        onClick={() => openMenu()}
      >
        <p>Device :</p>
        <p className="text-s-white text-left hover:text-s-purple w-48 font-body text-ellipsis whitespace-nowrap overflow-clip text-base">
          {debuggingMode === false ? selectedDevice[1] : selectedDevice[0]}
        </p>
      </button>
      <ul
        className={`${
          clicked === false ? "hidden" : "flex shadow-md"
        } w-full max-h-[30em] overflow-y-auto flex-col bg-s-bg-light absolute z-10 rounded-md divide-s-bg-dark divide-y px-4`}
      >
        {boards.map((board, index) => (
          <PortItem
            key={index}
            device={board}
            handleClick={handleClick}
            debuggingMode={debuggingMode}
          />
        ))}
      </ul>
    </div>
  );
}

export { SelectBoard };
