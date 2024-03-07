import { useState } from "react";
import { checkDataDirectory, deletePreset, readValuesFile } from "./HandleData";

type selectPresetProps = {
  selectedPreset: string;
  setSelectedPreset: React.Dispatch<React.SetStateAction<string>>;
  setValues: React.Dispatch<React.SetStateAction<number[][]>>;
  disabled: boolean;
};

type presetItemProps = {
  label: string;
  handleClick: (label: string) => void;
};

function PresetItem({ label, handleClick }: presetItemProps) {
  async function deletePresetLocal() {
    const dialogModule = await import("@tauri-apps/api/dialog");

    const confirmed = await dialogModule.confirm(
      "Are you sure to delete this preset ?\n This action cannot be reverted",
      { title: "Souffle - Desktop", type: "warning", okLabel: "Delete" }
    );
    if (confirmed) {
      try {
        await deletePreset(label);
      } catch (err) {
        console.error("An error occured : " + err);
      }
    }
  }

  return (
    <li className="">
      <div className="flex items-center">
        <button
          className="flex text-s-white w-full hover:text-s-purple text-left align-middle h-max overflow-clip text-ellipsis whitespace-nowrap"
          onClick={() => handleClick(label)}
        >
          {label}
        </button>

        <button
          className={`${
            label === "Default"
              ? "fill-s-bg-light"
              : "fill-s-bg-dark hover:fill-s-purple relative after:absolute after:right-10 after:bottom-5 after:shadow-lg after:z-10 after:block after:rounded-lg after:bg-s-bg-light after:text-2xs after:text-s-bg-dark after:text-body after:opacity-0 after:transition after:duration-200 after:content-[''] hover:after:px-2 hover:after:py-1 hover:after:opacity-100 hover:after:delay-500 after:whitespace-nowrap hover:after:content-['Delete_Preset']"
          } flex justify-center items-center w-12 h-12 rounded-full`}
          onClick={() => deletePresetLocal()}
          disabled={label === "Default"}
        >
          <svg
            width="20"
            height="20"
            fill="inherit"
            viewBox="0 0 576 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M576 128c0-35.3-28.7-64-64-64H205.3c-17 0-33.3 6.7-45.3 18.7L9.4 233.4c-6 6-9.4 14.1-9.4 22.6s3.4 16.6 9.4 22.6L160 429.3c12 12 28.3 18.7 45.3 18.7H512c35.3 0 64-28.7 64-64V128zM271 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
          </svg>
        </button>
      </div>
    </li>
  );
}

function SelectPreset({
  selectedPreset,
  setSelectedPreset,
  setValues,
  disabled,
}: selectPresetProps) {
  const [clicked, setClicked] = useState(false);
  const [presetsList, setPresetsList] = useState([""]);

  async function openMenu() {
    const fs = await import("@tauri-apps/api/fs");
    const path = await import("@tauri-apps/api/path");

    await checkDataDirectory();

    const appDataPath = await path.appDataDir();
    const inventoryPath = `${appDataPath}presets/inventory.txt`;

    const presets = await fs.readTextFile(inventoryPath);
    setPresetsList(
      presets.split("\n").filter((line: string) => line.trim() !== "")
    );
    setClicked(true);
  }

  async function handleClick(label: string) {
    const presetValues = await readValuesFile(label);

    setValues(presetValues);
    setSelectedPreset(label);
    setClicked(false);
  }

  return (
    <div className="relative z-0" onMouseLeave={() => setClicked(false)}>
      <button
        className="text-s-purple font-body text-lg flex justify-start gap-4 items-baseline disabled:text-bg-s-dark"
        onClick={async () => await openMenu()}
        disabled={disabled}
      >
        <p>Preset :</p>
        <p className="text-s-white text-left hover:text-s-purple w-48 font-body text-ellipsis whitespace-nowrap overflow-clip text-base">
          {selectedPreset}
        </p>
      </button>
      <ul
        className={`${
          clicked === false ? "hidden" : "flex shadow-md"
        } w-full max-h-[30em] overflow-y-auto overflow-x-clip text-ellipsis flex-col bg-s-bg-light absolute z-10 rounded-md divide-s-bg-dark divide-y px-4`}
      >
        {presetsList.map((preset, index) => (
          <PresetItem key={index} label={preset} handleClick={handleClick} />
        ))}
      </ul>
    </div>
  );
}

export { SelectPreset };
