import { Slider } from "@mui/material";
import styled from "styled-components";

type InterfaceSliderProps = {
  label: string;
  values: Array<Array<number>>;
  setValues: React.Dispatch<React.SetStateAction<number[][]>>;
  focused: number;
  index: number;
  min: number;
  max: number;
  step: number;
  direction: "normal" | "inverted";
};

const InterfaceSliderStyled = styled(Slider)({
    height: 2,
    "& .MuiSlider-rail": {
      color: "rgb(var(--s-purple) / 1)",
      opacity: 1,
    },
    "& .MuiSlider-track": {
      background: "rgb(var(--s-pink) / 1)",
      border: "none",
      opacity: 1,
    },

    "& .MuiSlider-thumb": {
      height: 25,
      width: 25,
      backgroundColor: "rgb(var(--s-bg-dark) / 1)",
      padding: "0.125em",
      background:
        "linear-gradient(135deg, rgb(var(--s-bg-dark) / 1), rgb(var(--s-bg-light) / 1)) content-box, linear-gradient(180deg, rgb(var(--s-bg-light) / 1), rgb(var(--s-bg-dark) / 1)) border-box",
      border: "none",
      "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
        boxShadow: "none",
      },
      "&::before": {
        display: "none",
      },
    },
  });

function InterfaceSlider({
  label,
  values,
  setValues,
  focused,
  index,
  min,
  max,
  step,
  direction,
}: InterfaceSliderProps) {
  const handleSliderChange = (event:any, newValue:number) => {
    //if min
    if (index === 3) {
      const accessibleMax = 127 - values[focused][4];
      if (newValue >= accessibleMax - 1) {
        newValue = accessibleMax - 1;
      }
    }

    //if max Remember that max = 0 when "real max" = 127. Big brain time
    if (index === 4) {
      if (newValue >= -values[focused][3] - 1 + 127) {
        newValue = -values[focused][3] - 1 + 127;
      }
    }

    const nextValues = values.map((parameters, i) => {
      if (i === focused) {
        parameters[index] = newValue;
        return parameters;
      } else {
        return parameters;
      }
    });
    setValues(nextValues);
  };

  const handleReset = () => {
    let resetValue = 0;

    const nextValues = values.map((parameters, i) => {
      if (i === focused) {
        parameters[index] = resetValue;
        return parameters;
      } else {
        return parameters;
      }
    });
    setValues(nextValues);
  };

  return (
    <div className="bg-s-bg-light flex rounded-full h-4 px-3 my-4 items-center">
      <InterfaceSliderStyled
        aria-label={label}
        value={values[focused][index]}
        min={min}
        max={max}
        step={step}
        onChange={handleSliderChange}
        onDoubleClick={handleReset}
        track={direction}
      />
    </div>
  );
}

export { InterfaceSlider };
