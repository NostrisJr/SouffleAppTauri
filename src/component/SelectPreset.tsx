import { Command } from "@tauri-apps/api/shell";
import { useState } from "react";

type selectPresetProps = {
  selectedPreset: string;
  setSelectedPreset: React.Dispatch<React.SetStateAction<string>>;
};

type presetItemProps = {
  label: string;
  onClick: any;
};

function PresetItem({ label, onClick }: presetItemProps) {
  return (
    <div>
      <button className="w-max" onClick={onClick}>{label}</button>
    </div>
  );
}

function SelectPreset({ selectedPreset, setSelectedPreset }: selectPresetProps) {
  const [clicked, setClicked] = useState(false);

  async function openMenu(){
    const fs = await import("@tauri-apps/api/fs");
    const path = await import("@tauri-apps/api/path");
    
    const appDataPath = await path.appDataDir();
    const cmdPath = `"${appDataPath}presets/"`
    console.log(cmdPath)
    const command = new Command("list-presets", [cmdPath])

    const output = await command.execute()
    console.log(output.stdout)
    console.log(output.stderr)

  }

  function handleClick(label:string){
    setSelectedPreset(label)
    setClicked(false)
  }
  return (
    <div className="relative z-0" onMouseLeave={() => setClicked(false)}>
      <button className="text-s-purple font-body text-lg flex justify-start  gap-4 items-baseline" onClick={() => openMenu()}>
        <p>Preset :</p>
        <p className="text-s-white font-body text-base">{selectedPreset}</p>
      </button>
      <div
        className={`${clicked === false ? "hidden" : "flex shadow-md"} w-full flex-col bg-s-bg-light absolute z-10 gap-4 p-4 rounded-md`}
      >
        <PresetItem
          label="un preset"
          onClick={()=>handleClick("un preset")}
        />
      </div>
    </div>
  );
}

export { SelectPreset };
