"use client";

import { InterfaceKnob } from "./InterfaceKnob";
import { InterfaceOutline } from "./InterfaceOutline";
import { useEffect } from "react";
import { InterfaceFaders } from "./InterfaceFaders";

type InterfaceProp = {
  colors: Array<Array<string>>;
  interfaceId: number;
  values: Array<Array<number>>;
  setValues: React.Dispatch<React.SetStateAction<Array<Array<number>>>>;
  focused: number;
  setFocused: React.Dispatch<React.SetStateAction<number>>;
  recolor: ({ focused, values }: recolorProp) => void;
};

type handlePotClickProp = {
  interfaceId: number;
  potId: number;
};

type openPlotProp = {
  focused: number;
};

type recolorProp = {
  focused: number;
  values: Array<Array<number>>;
};

function InterfaceItem({
  colors,
  interfaceId,
  values,
  setValues,
  focused,
  setFocused,
  recolor,
}: InterfaceProp) {
  
  useEffect(() => {
    recolor({ focused, values });
  }, [focused, values]);

  function handleOutlineClick(interfaceId: number) {
    setFocused(interfaceId);
  }

  function handlePotClick({ interfaceId, potId }: handlePotClickProp) {
    const nextValues = values.map((parameters, i) => {
      if (i === interfaceId) {
        parameters[0] = potId;
        return parameters;
      } else {
        return parameters;
      }
    });
    setValues(nextValues);
    setFocused(interfaceId);
  }

  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinejoin: "round",
          strokeMiterlimit: 2,
        }}
        viewBox="0 0 167 244"
        width="100%"
        height="100%"
      >
        <InterfaceOutline interfaceId={interfaceId} colors={colors} handleOutlineClick={handleOutlineClick} />
        <InterfaceKnob
          potId={1}
          interfaceId={interfaceId}
          colors={colors}
          transform="matrix(.50833 0 0 .50833 -2907.226 -3243.35)"
          handlePotClick={handlePotClick}
        />
        <InterfaceKnob
          potId={2}
          interfaceId={interfaceId}
          colors={colors}
          transform="matrix(.50833 0 0 .50833 -2907.226 -3193.594)"
          handlePotClick={handlePotClick}
        />
        <InterfaceKnob
          potId={3}
          interfaceId={interfaceId}
          colors={colors}
          transform="matrix(.50833 0 0 .50833 -2907.226 -3143.992)"
          handlePotClick={handlePotClick}
        />
        <InterfaceKnob
          potId={4}
          interfaceId={interfaceId}
          colors={colors}
          transform="matrix(.50833 0 0 .50833 -2907.226 -3094.396)"
          handlePotClick={handlePotClick}
        />

        <InterfaceFaders interfaceId={interfaceId} handlePotClick={handlePotClick} colors={colors} />
      </svg>
    </div>
  );
}

export { InterfaceItem };
