"use client";

import React from "react";
import { Command } from "@tauri-apps/api/shell";

import { InterfaceChart } from "../component/InterfaceChart";
import { InterfaceItem } from "../component/InterfaceItem";
import { useState } from "react";
import { SelectPort } from "@/component/SelectPort";

type recolorProp = {
  focused: number;
  values: Array<Array<number>>;
};

function Home() {
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

  //based on Spitfire libraries
  const defalutValues = [
    [1, 1, 7, 0, 127, 0], //plugin volume
    [2, 1, 16, 0, 127, 0], //speed/tightness
    [3, 1, 17, 0, 127, 0], // release
    [4, 1, 19, 0, 127, 0], //reverb
    [5, 1, 11, 0, 127, 0], //expression
    [6, 1, 1, 0, 127, 0], //dynamics
    [7, 1, 21, 0, 127, 0], // vibrato
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
    [-1, 1, 0, 0, 127, 0],
  ];

  // index by interfaceId then by potID, knowing that 0 stands for the outline
  const [colors, setColors] = useState<Array<Array<string>>>(() =>
    Array.from({ length: nbInterfaces }, () => Array(8).fill(colorFill[0]))
  );

  const [ports, setPorts] = useState<Array<string>>([""]);
  const [selectedPort, setSelectedPort] = useState<string>("");

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

  function sendConfiguration() {

  }

  async function getDevices() {
    const output = await new Command("ls").execute();
    const foundPorts = output.stdout.split("\n").map((str) => str.substring(9));
    console.log(foundPorts);
    setPorts(foundPorts);
  }

  return (
    <>
      <div className="bg-s-bg-dark grid grid-cols-5 gap-5 p-10 h-screen">
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
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none"
              onClick={() => setValues(defalutValues)}
            >
              Default
            </button>
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none"
              onClick={() => {
                sendConfiguration();
              }}
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
          />
          <div className="bg-s-bg-light flex justify-center my-4 w-full">
            <SelectPort
              ports={ports}
              selectedPort={selectedPort}
              setSelectedPort={setSelectedPort}
              className="bg-s-bg-light text-lg text-s-white font-body focus:ring-0 border-none focus:border-none m-2"
            />
          </div>
          <div className="items-center w-full justify-center flex">
            <button
              className="px-6 py-2 transition ease-in duration-150 font-display font-normal text-s-purple text-2xl rounded-full hover:bg-s-purple hover:text-s-white border-2 border-s-purple focus:outline-none"
              onClick={() => {
                getDevices();
              }}
            >
              Refresh Devices
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
