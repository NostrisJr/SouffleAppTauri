"use client";

import React from "react";
import { Command } from "@tauri-apps/api/shell";

import { InterfaceChart } from "@/component/InterfaceChart";
import { InterfaceItem } from "@/component/InterfaceItem";
import { useState } from "react";
import { SelectPort } from "@/component/SelectPort";
import { createPreset, defaultValues } from "@/component/HandleData";
import { SelectPreset } from "@/component/SelectPreset";

type recolorProp = {
  focused: number;
  values: Array<Array<number>>;
};

function Home() {
  const [disabled, setDisabled] = useState(false);

  const nbInterfaces = 15;
  const colorFill: string[] = ["rgb(var(--s-bg-light)/1)", "rgb(var(--s-purple)/1)", "rgb(var(--s-pink)/1)"];
  const [focused, setFocused] = useState<number>(0);

  /*index by interfaceId (PotId[1 to 7, -1 means unused ], MIDI CH, MIDI CC, min, max, bend)
  
  please note that bend is an int in [-300, 300] but is used as a float between -3.00 and 3.00 
  in following computation (thus to avoid approx when passed to arduino via parsing)
  */
  const [values, setValues] = useState<Array<Array<number>>>(() =>
    Array.from({ length: nbInterfaces }, () => [-1, 1, 1, 0, 127, 0])
  );

  const [selectedPreset, setSelectedPreset] = useState("no preset selected...");

  // index by interfaceId then by potID, knowing that 0 stands for the outline
  const [colors, setColors] = useState<Array<Array<string>>>(() =>
    Array.from({ length: nbInterfaces }, () => Array(8).fill(colorFill[0]))
  );

  const [ports, setPorts] = useState<Array<Array<string>>>([[""]]);
  const [selectedDevice, setSelectedDevice] = useState<Array<string>>(["", "", ""]);

  function recolor({ focused, values }: recolorProp) {
    let nextColors: Array<Array<string>> = Array.from({ length: nbInterfaces }, () => Array(8).fill(colorFill[0]));

    for (let interfaceId = 0; interfaceId < nbInterfaces; interfaceId++) {
      if (interfaceId === focused) {
        /* if we are looking at the focused interface */
        nextColors[interfaceId][0] = colorFill[2];

        for (let potId = 1; potId <= 7; potId++) {
          if (potId === values[interfaceId][0]) {
            nextColors[interfaceId][potId] = colorFill[2]; /* highlight used pot in pink */
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
              nextColors[interfaceId][potId] = colorFill[1]; /* highlight used pot in purple*/
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

  async function sendConfiguration() {
    setDisabled(true);

    const pathModule = await import("@tauri-apps/api/path"); // dynamic import. Causes "navigator undefined" if static import
    const pathSketch = await pathModule.resolveResource("resources/Arduino/default");
    const pathConfig = await pathModule.resolveResource("resources/Arduino15/arduino-cli.yaml");

    const commandCompile: Command = Command.sidecar("binaries/arduino-cli", [
      "compile",
      "--fqbn",
      "arduino:avr:leonardo",
      pathSketch,
      "--config-file",
      pathConfig,
      "-v",
    ]);
    const compileOutput = await commandCompile.execute();
    if (compileOutput.code !== 0) {
      alert("An error has occurred while compiling");
      console.log(compileOutput.stdout);
      console.error(compileOutput.stderr);
    }

    const commandUpload: Command = Command.sidecar("binaries/arduino-cli", [
      "upload",
      "-p",
      selectedDevice[0],
      "--fqbn",
      "arduino:avr:leonardo",
      pathSketch,
      "--config-file",
      pathConfig,
      "-v",
    ]);

    commandUpload.execute().then((output) => {
      if (output.code === 0) {
        alert("Code uploaded ! \n Have a good time making music");
      } else {
        alert(
          "An error occured while uploading \n Please reconnect your controller and retry \n Or consult our documentation"
        );
        console.log(compileOutput.stdout);
        console.error(compileOutput.stderr);
      }
      setDisabled(false);
    });
  }

  async function getDevices() {
    const pathModule = await import("@tauri-apps/api/path"); // dynamic import. Causes "navigator undefined" if static import
    const pathConfig = await pathModule.resolveResource("resources/Arduino15/arduino-cli.yaml");

    const commandCompile: Command = Command.sidecar("binaries/arduino-cli", [
      "board",
      "list",
      "--config-file",
      pathConfig,
    ]);

    const compileOutput = await commandCompile.execute();
    const foundPorts = compileOutput.stdout
      .split("\n")
      .map((str: string) => str.split(/\s+/))
      .filter((list: string[]) => !list.every((element) => element === ""));

    const matchedPorts = foundPorts.filter((list) => list[4] === "(USB)").map((list) => [list[0], list[5], list[6]]);

    console.log(matchedPorts);
    setPorts(matchedPorts);
  }

  return (
    <div className="relative z-0 w-full h-screen items-center justify-around bg-s-bg-dark flex flex-col">
      <div
        className={`${disabled === false ? "hidden" : "flex flex-col"} bg-s-bg-light absolute h-1/3 w-1/2 z-10 items-center justify-center rounded-xl border-s-purple border-2 shadow-xl text-xl font-body text-s-purple`}
      >
        <p>Saving preset on your controller...</p>
        <p>Please do not disconnect it !</p>
      </div>
      <div className="p-4 w-full bg-s-bg-light flex justify-around items-center">
        <div className="flex gap-4">
          <SelectPreset selectedPreset={selectedPreset} setSelectedPreset={setSelectedPreset}/>
        </div>
        <button className="text-s-purple font-body text-lg">Presets</button>
      </div>
      <div className="grid grid-cols-5 gap-5 p-10">
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
          <div className="flex items-center justify-center gap-4 m-4">
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={() => setValues(defaultValues)}
              disabled={disabled}
            >
              Default
            </button>
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={() => createPreset({ values, name: "test" })}
              disabled={disabled}
            >
              save
            </button>
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={() => {
                sendConfiguration();
              }}
              disabled={disabled}
            >
              Send
            </button>
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
          <div className="bg-s-bg-light flex justify-center my-4 w-full">
            <SelectPort
              ports={ports}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              className="bg-s-bg-light text-lg text-s-white disabled:text-s-bg-dark font-body focus:ring-0 border-none focus:border-none m-2"
              disabled={disabled}
            />
          </div>
          <div className="items-center w-full justify-center flex">
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full enabled:hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none disabled:text-s-bg-light disabled:border-bg-s-light disabled:border-s-bg-light"
              onClick={() => {
                getDevices();
              }}
              disabled={disabled}
            >
              Refresh Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
