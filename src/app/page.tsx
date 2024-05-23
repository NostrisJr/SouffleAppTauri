"use client";

import React, { useEffect } from "react";
import { Command } from "@tauri-apps/api/shell";

import { InterfaceChart } from "@/component/InterfaceChart";
import { InterfaceItem } from "@/component/InterfaceItem";
import { useState } from "react";
import { SelectBoard } from "@/component/SelectBoard";
import {
  checkDataDirectory,
  clearTmpFiles,
  createPreset,
  createTempInoFile,
} from "@/component/HandleData";
import { SelectPreset } from "@/component/SelectPreset";
import { logError, logMessage } from "@/component/DebuggingMode";
import {
  checkResourcesDirectory,
  modifyArduinoLeonardoName,
} from "@/component/HandleResourcesDir";
import { DEFAULT_VALUES, NB_INTERFACES } from "@/component/Constants";

type recolorProp = {
  focused: number;
  values: Array<Array<number>>;
};

function Home() {
  //********************** ***********************//
  //*********** Some disableing values ***********//
  //********************** ***********************//

  const [disabledToSave, setDisabledToSave] = useState(false);
  const [disabledToSend, setDisabledToSend] = useState(false);

  const [saveDisabled, setSaveDisabled] = useState(true);
  const [explanationYouShallNotSave, setExplanationYouShallNotSave] =
    useState(false);

  const [disabledToResetResources, setDisabledToResetResources] =
    useState(false);

  const [disabledToResetTools, setDisabledToResetTools] = useState(false);

  let disabled =
    disabledToSave ||
    disabledToSend ||
    disabledToResetResources ||
    disabledToResetTools;

  const [debuggingMode, setDebuggingMode] = useState(false);

  //********************** ************************//
  //********** A few constants and defs ***********//
  //********************** ************************//
  const nbInterfaces = NB_INTERFACES;
  const colorFill: string[] = [
    "rgb(var(--s-bg-light)/1)",
    "rgb(var(--s-purple)/1)",
    "rgb(var(--s-pink)/1)",
  ];
  const [focused, setFocused] = useState<number>(0);

  /*index by interfaceId (PotId[1 to 7, -1 means unused ], MIDI CH, MIDI CC, min, max, bend, unused but maybe later)
  
  please note that bend is an int in [-300, 300] but is used as a float between -3.00 and 3.00 
  in following computation (thus to avoid approx when passed to arduino via parsing)
  */
  const [values, setValues] = useState<Array<Array<number>>>(() =>
    Array.from({ length: nbInterfaces }, () => [-1, 1, 1, 0, 127, 0, 0])
  );

  const defaultValues = DEFAULT_VALUES;

  //******************** ********************//
  //*********** Coloration stuff ***********//
  //******************** *******************//

  const [selectedPreset, setSelectedPreset] = useState("no preset selected...");
  const [existingPresets, setExistingPresets] = useState([""]);

  // index by interfaceId then by potID, knowing that 0 stands for the outline
  const [colors, setColors] = useState<Array<Array<string>>>(() =>
    Array.from({ length: nbInterfaces }, () => Array(8).fill(colorFill[0]))
  );

  function recolor({ focused, values }: recolorProp) {
    let nextColors: Array<Array<string>> = Array.from(
      { length: nbInterfaces },
      () => Array(8).fill(colorFill[0])
    );

    for (let interfaceId = 0; interfaceId < nbInterfaces; interfaceId++) {
      if (interfaceId === focused) {
        /* if we are looking at the focused interface */
        nextColors[interfaceId][0] = colorFill[2];

        for (let potId = 1; potId <= 7; potId++) {
          if (potId === values[interfaceId][0]) {
            nextColors[interfaceId][potId] =
              colorFill[2]; /* highlight used pot in pink */
          } else {
            nextColors[interfaceId][potId] = colorFill[0];
          }
        }
      } else {
        if (values[interfaceId][0] !== -1) {
          /* if there is a used pot in this interface*/

          nextColors[interfaceId][0] = colorFill[1];

          for (let potId = 1; potId <= 7; potId++) {
            if (potId === values[interfaceId][0]) {
              nextColors[interfaceId][potId] =
                colorFill[1]; /* highlight used pot in purple*/
            } else {
              nextColors[interfaceId][potId] = colorFill[0];
            }
          }
        } else {
          for (let potId = 1; potId <= 7; potId++) {
            nextColors[interfaceId][potId] = colorFill[0];
          }
        }
      }
    }

    setColors(nextColors);
    return;
  }

  function resetToDefaultValues() {
    setValues(defaultValues);
    setFocused(0);
  }

  //********************* *********************//
  //*********** Craft and send code ***********//
  //********************* *********************//

  const [boards, setBoards] = useState<Array<Array<string>>>([
    ["No port found yet...", "No device found yet...", ""],
  ]);

  const [selectedDevice, setSelectedDevice] = useState<Array<string>>([
    "Please select a port...",
    "Please select a device...",
    "",
  ]);

  let sendDisabled =
    disabledToSend ||
    ((selectedDevice[0] === "Please select a port..." ||
      selectedDevice[1] === "Please select a device..." ||
      selectedDevice[0] === "No port found yet..." ||
      selectedDevice[1] === "No device found yet..." ||
      selectedDevice[0] === "No port found" ||
      selectedDevice[1] === "No device found") &&
      !debuggingMode);

  async function resetArduinoCliTools() {
    const path = await import("@tauri-apps/api/path"); // dynamic import. Causes "navigator undefined" if static import
    const dialog = await import("@tauri-apps/api/dialog");
    const fs = await import("@tauri-apps/api/fs");

    const internetConnection = await dialog.ask(
      "Have you an Internet connection ?",
      "Windmill"
    );

    if (!internetConnection) {
      await dialog.message(
        "Please connect you computer to the Internet before re-trying",
        "Windmill"
      );
      return;
    }

    setDisabledToResetTools(true);

    await checkDataDirectory();
    await checkResourcesDirectory({
      setDisabled: setDisabledToResetResources,
      forceReset: false,
    });

    const appDataPath = await path.appDataDir();
    const pathConfig = `${appDataPath}Resources/Arduino15/arduino-cli.yaml`;

    const pathArduinoCore = `${appDataPath}Resources/Arduino15/packages/arduino`;
    const arduinoCoreExists = await fs.exists(pathArduinoCore);

    // let's remove the old core if it exists
    if (arduinoCoreExists) {
      const commandRemove: Command = Command.sidecar("binaries/arduino-cli", [
        "core",
        "uninstall",
        "arduino:avr",
        "--config-file",
        pathConfig,
        "-v",
      ]);

      const removeOutput = await commandRemove.execute();

      if (removeOutput.code !== 0) {
        dialog.message(
          "An error has occurred while removing arduino-cli core arduino:avr"
        );

        if (removeOutput.stdout.length >= 1) {
          logMessage(removeOutput.stdout);
        }
        if (removeOutput.stderr.length >= 1) {
          logError(removeOutput.stderr);
        }

        return;
      } else {
        logMessage("Arduino-cli core arduino:avr removed !");
        logMessage(removeOutput.stdout);
      }
    }

    // let's update the core index
    const commandUpdate: Command = Command.sidecar("binaries/arduino-cli", [
      "core",
      "update-index",
      "--config-file",
      pathConfig,
      "-v",
    ]);

    const updateOutput = await commandUpdate.execute();

    if (updateOutput.code !== 0) {
      logError("An error has occurred while updating arduino-cli core index");

      if (updateOutput.stdout.length >= 1) {
        logMessage(updateOutput.stdout);
      }
      if (updateOutput.stderr.length >= 1) {
        logError(updateOutput.stderr);
      }

      return;
    } else {
      logMessage("Arduino-cli core index updated !");
      logMessage(updateOutput.stdout);
    }

    // let's install the new core
    const commandInstall: Command = Command.sidecar("binaries/arduino-cli", [
      "core",
      "install",
      "arduino:avr",
      "--config-file",
      pathConfig,
      "-v",
    ]);

    const installOutput = await commandInstall.execute();

    if (installOutput.code !== 0) {
      logError(
        "An error has occurred while installing arduino-cli core arduino:avr"
      );

      if (installOutput.stdout.length >= 1) {
        logMessage(installOutput.stdout);
      }
      if (installOutput.stderr.length >= 1) {
        logError(installOutput.stderr);
      }

      return;
    } else {
      logMessage("Arduino-cli core arduino:avr installed !");
      logMessage(installOutput.stdout);
    }

    try {
      await modifyArduinoLeonardoName();
    } catch (err) {
      logError("An error occured while modifying boards.txt : " + err);
    }

    // let's run arduino-cli board list to install the needed discovery tools for the machine
    await refreshDevices();

    logMessage("Arduino-cli core arduino:avr sucessfully reseted !");
    setDisabledToResetTools(false);
    dialog.message("Arduino-cli core arduino:avr sucessfully reseted !");
  }

  async function sendConfiguration() {
    setDisabledToSend(true);

    await checkDataDirectory();
    await checkResourcesDirectory({
      setDisabled: setDisabledToResetResources,
      forceReset: false,
    });

    logMessage("Sending configuration to the controller...");
    logMessage("Values to send : " + values);

    const path = await import("@tauri-apps/api/path"); // dynamic import. Causes "navigator undefined" if static import
    const dialog = await import("@tauri-apps/api/dialog");
    const appDataPath = await path.appDataDir();
    const pathTmpFolder = `${appDataPath}tmp/`;
    const pathConfig = `${appDataPath}Resources/Arduino15/arduino-cli.yaml`;

    const tmpName = Date.now().toString();
    const pathTmpIno = `${pathTmpFolder}sketch_${tmpName}`;

    await createTempInoFile({ name: tmpName, values: values });

    const commandCompile: Command = Command.sidecar("binaries/arduino-cli", [
      "compile",
      "--fqbn",
      "arduino:avr:leonardo",
      pathTmpIno,
      "--config-file",
      pathConfig,
      "-v",
      "--optimize-for-debug",
      "-p",
      selectedDevice[0],
      "-u",
    ]);
    const compileOutput = await commandCompile.execute();

    if (compileOutput.code !== 0) {
      dialog.message("An error has occurred while compiling & uploading");

      if (compileOutput.stdout.length >= 1) {
        logMessage(compileOutput.stdout);
      }
      if (compileOutput.stderr.length >= 1) {
        logError(compileOutput.stderr);
      }

      setDisabledToSend(false);
      return;
    }
    dialog.message("Code uploaded ! \n Have a good time making music");
    logMessage(compileOutput.stdout);

    setDisabledToSend(false);

    if (!debuggingMode) {
      await clearTmpFiles();
    } else {
      logMessage("Cleaning temporary files skipped. Debug mode active");
    }
  }

  async function refreshDevices() {
    await checkDataDirectory();
    await checkResourcesDirectory({
      setDisabled: setDisabledToResetResources,
      forceReset: false,
    });

    const path = await import("@tauri-apps/api/path"); // dynamic import. Causes "navigator undefined" if static import
    const appDataPath = await path.appDataDir();
    const pathConfig = `${appDataPath}Resources/Arduino15/arduino-cli.yaml`;

    const commandCompile: Command = Command.sidecar("binaries/arduino-cli", [
      "board",
      "list",
      "--config-file",
      pathConfig,
    ]);

    const compileOutput = await commandCompile.execute();

    if (compileOutput.stdout.length >= 1) {
      logMessage(compileOutput.stdout);
    }
    if (compileOutput.stderr.length >= 1) {
      logError(compileOutput.stderr);
    }

    const foundBoards = compileOutput.stdout
      .split("\n")
      .map((str: string) => str.split(/\s+/))
      .filter((list: string[]) => !list.every((element) => element === ""))
      .slice(1);

    let matchedBoards;
    if (!debuggingMode) {
      matchedBoards = foundBoards
        .filter((list: Array<string>) => list[4] === "(USB)")
        .map((list: Array<string>) => [list[0], list[5], list[6]]);
    } else {
      matchedBoards = foundBoards.map((list: Array<string>) => [
        list[0],
        list[5],
        list[6],
      ]);
    }

    if (matchedBoards.length >= 1) {
      setBoards(matchedBoards);
    } else {
      setBoards([["No port found", "No device found", ""]]);
    }
  }

  async function handleDebugMode() {
    const window = await import("@tauri-apps/api/window");

    try {
      const debuggingWindow = window.WebviewWindow.getByLabel("Debugging");

      if (!debuggingMode) {
        if (debuggingWindow !== null) {
          logMessage("Debugging window already exists.");
          return;
        }

        const webview = new window.WebviewWindow("Debugging", {
          url: "debugging",
          title: "Debugging",
        });

        await new Promise<void>((resolve, reject) => {
          webview.once("tauri://created", () => {
            console.log("Debugging window created");
            resolve();
          });
          webview.once("tauri://error", (e) => {
            logError(
              "An error occurred during debugging window creation: " + e
            );
            reject(e);
          });
        });

        webview.onCloseRequested(async () => {
          webview.close();
          setDebuggingMode(false);
        });

        setDebuggingMode(true);
      } else {
        if (debuggingWindow !== null) {
          try {
            await debuggingWindow.close();
            setDebuggingMode(false);
          } catch (err) {
            logError("Error while closing debug window : " + err);
          }
        }
      }
    } catch (error) {
      logError("Error handling debug mode: " + error);
    }
  }

  async function resetResourcesDir() {
    await checkResourcesDirectory({
      setDisabled: setDisabledToResetResources,
      forceReset: true,
    });
    await resetArduinoCliTools();
  }

  //********************** *********************//
  //*********** Save or edit presets ***********//
  //********************** *********************//

  // Delete function is in SelectPreset Component

  const [namePresetSaved, setNamePresetSaved] = useState("");
  let newName = "";

  const handleSavePresetChange = (
    name: React.ChangeEvent<HTMLInputElement>
  ) => {
    newName = name.target.value;
    if (
      !existingPresets.includes(newName.toLowerCase().trim()) &&
      newName.trim().length >= 1
    ) {
      newName = newName.charAt(0).toUpperCase() + newName.slice(1);
      setNamePresetSaved(newName);
      setSaveDisabled(false);
      setExplanationYouShallNotSave(false);
    } else {
      setNamePresetSaved(newName);
      setSaveDisabled(true);
      setExplanationYouShallNotSave(true);
    }
  };

  async function initSavePreset() {
    const path = await import("@tauri-apps/api/path");
    const fs = await import("@tauri-apps/api/fs");

    await checkDataDirectory();

    const appDataPath = await path.appDataDir();
    const inventoryPath = `${appDataPath}presets/inventory.txt`;

    const presetsRaw = await fs.readTextFile(inventoryPath);
    const presetLC = presetsRaw
      .split("\n")
      .filter((line: string) => line.trim() !== "")
      .map((preset: string) => preset.toLowerCase());

    setExistingPresets(presetLC);
    setDisabledToSave(true);
  }

  async function endSavePreset() {
    try {
      await createPreset({
        name: namePresetSaved.trim(),
        values: values,
        init: false,
      });
      setDisabledToSave(false);
      setDisabledToSave(false);
      setNamePresetSaved("");
      setSaveDisabled(true);
      setExplanationYouShallNotSave(false);
    } catch (err) {
      alert("Something went wrong :" + err);
    }
  }

  function cancelSavePreset() {
    setNamePresetSaved("");
    setDisabledToSave(false);
    setExplanationYouShallNotSave(false);
  }

  //********************** *********************//
  //************** Menu handling ***************//
  //********************** *********************//

  async function listenMenuEvents() {
    const window = await import("@tauri-apps/api/window");

    if (!disabled) {
      try {
        window.appWindow.listen(
          "save_preset",
          async () => await initSavePreset()
        );
        window.appWindow.listen(
          "refresh_devices",
          async () => await refreshDevices()
        );
        window.appWindow.listen("default_values", () => resetToDefaultValues());
        window.appWindow.listen(
          "send_values",
          async () => await sendConfiguration()
        );
        window.appWindow.listen(
          "debug_mode",
          async () => await handleDebugMode()
        );
        window.appWindow.listen("reset_resources", async () => {
          await checkDataDirectory();
          await resetResourcesDir();
        });
        window.appWindow.listen("reset_arduino_cli_tools", async () => {
          await resetArduinoCliTools();
        });
      } catch (err) {
        logError("An error occurred while using menu functions : " + err);
      }
    }
  }

  useEffect(() => {
    // don't listen to menu event when another thing is happening
    if (!disabled) {
      listenMenuEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-0 w-full h-screen items-center bg-s-bg-dark flex flex-col">
      <div
        className={`${
          disabledToResetResources === false ? "hidden" : "flex flex-col"
        } top-1/3 justify-self-center bg-s-bg-light absolute h-1/3 w-1/2 z-50 items-center justify-center rounded-xl border-s-purple border-2 shadow-xl text-xl font-body text-s-purple`}
      >
        <p>Setting Resources folder right...</p>
        <p>It should not take more than a few minutes !</p>
      </div>

      <div
        className={`${
          disabledToResetTools === false ? "hidden" : "flex flex-col"
        } top-1/3 justify-self-center bg-s-bg-light absolute h-1/3 w-1/2 z-40 items-center justify-center rounded-xl border-s-purple border-2 shadow-xl text-xl font-body text-s-purple`}
      >
        <p>Reseting Arduino-cli core tools...</p>
        <p>It should not take more than a few minutes !</p>
        <p className="text-sm mt-4">
          You need to have your computer connected to internet...
        </p>
        <p className="text-sm">
          (If this stays more than 5 min, please quit Windmill and retry with
          internet connexion)
        </p>
      </div>

      <div
        className={`${
          disabledToSend === false ? "hidden" : "flex flex-col"
        } top-1/3 justify-self-center bg-s-bg-light absolute h-1/3 w-1/2 z-30 items-center justify-center rounded-xl border-s-purple border-2 shadow-xl text-xl font-body text-s-purple`}
      >
        <p>Saving preset on your controller...</p>
        <p>Please do not disconnect it !</p>
      </div>

      <div
        className={`${
          disabledToSave === false ? "hidden" : "flex flex-col"
        } top-1/3 bg-s-bg-light absolute h-1/3 w-1/2 z-30 items-center justify-center rounded-xl border-s-purple border-2 shadow-xl text-xl font-body text-s-purple gap-4 transition duration-500`}
      >
        <div className="flex gap-4 items-center justify-center">
          <label className="font-display text-3xl">Save as</label>
          <input
            className="bg-s-bg-light outline-none caret-s-white font-body text-s-white rounded-xl border-none px-2 placeholder:text-s-bg-dark"
            id="nameChoiceInput"
            type="text"
            onChange={handleSavePresetChange}
            placeholder=" My preset's name..."
            value={namePresetSaved}
          />
          <span
            className={`${
              explanationYouShallNotSave === false
                ? "opacity-0"
                : "opacity-100 transition duration-400 delay-500"
            } absolute top-6 text-s-pink font-body text-base`}
          >
            Name already took or invalid
          </span>
        </div>
        <div className="bg-s-purple h-[.07em] w-3/4" />
        <div className="flex justify-center gap-4 pt-4 items-center">
          <button
            className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-dark disabled:border-bg-s-dark disabled:border-s-bg-dark"
            onClick={() => cancelSavePreset()}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-dark disabled:border-bg-s-dark disabled:border-s-bg-dark"
            onClick={() => endSavePreset()}
            disabled={saveDisabled}
          >
            Save
          </button>
        </div>
      </div>
      <div
        className={`${
          disabled === false ? "hidden" : "block"
        } bg-s-bg-dark opacity-50 absolute z-[5] w-full h-full`}
      />
      <div className="w-full bg-s-bg-light flex justify-between">
        <div className="flex p-4 items-baseline">
          <SelectPreset
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            setValues={setValues}
            disabled={disabled}
          />
          <SelectBoard
            boards={boards}
            selectedDevice={selectedDevice}
            setSelectedDevice={setSelectedDevice}
            debuggingMode={debuggingMode}
          />
          <button
            className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-dark disabled:border-bg-s-dark disabled:border-s-bg-dark"
            onClick={() => {
              refreshDevices();
            }}
            disabled={disabled}
          >
            Refresh Devices
          </button>
        </div>
        <div className="items-center flex p-4">
          <button
            className={`px-6 py-2 cursor-default transition ease-in duration-150 font-display font-normal text-xl border-2 rounded-full disabled:text-s-bg-dark disabled:border-bg-s-dark disabled:border-s-bg-dark border-s-purple focus:outline-none ${
              !debuggingMode
                ? "hidden text-s-purple enabled:hover:bg-s-purple hover:text-s-white"
                : "block text-s-white enabled:bg-s-purple"
            }`}
            disabled={disabled}
          >
            Debugging Mode
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-5 p-10 self-center">
        <div className="col-span-3 justify-items-center">
          <div className="grid grid-cols-5 gap-5">
            {Array.from(Array(15).keys()).map((interfaceId) => (
              <InterfaceItem
                key={interfaceId}
                interfaceId={interfaceId}
                colors={colors}
                values={values}
                setValues={setValues}
                focused={focused}
                setFocused={setFocused}
                recolor={recolor}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col w-full items-start">
          <InterfaceChart
            className="flex justify-center w-full mb-4"
            bend={values[focused][5]}
            min={values[focused][3]}
            max={values[focused][4]}
            colorFill={colorFill}
            values={values}
            setValues={setValues}
            focused={focused}
            disabled={disabled}
          />
          <div className="items-center w-full gap-4 mt-4 justify-center flex">
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={() => resetToDefaultValues()}
              disabled={disabled}
            >
              Default
            </button>
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={async () => await initSavePreset()}
              disabled={disabled}
            >
              Save
            </button>
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={async () => await sendConfiguration()}
              disabled={sendDisabled}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
