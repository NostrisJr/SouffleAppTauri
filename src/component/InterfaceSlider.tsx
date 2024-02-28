import { Slider } from "@mui/material";
import "./interfaceSlider.css";

type InterfaceSliderProps = {
  label: string;
  values: Array<Array<number>>;
  setValues: React.Dispatch<React.SetStateAction<number[][]>>;
  focused: number;
  index: number;
  min: number;
  max: number;
  step: number;
  direction: "normal" | "inverted" | false | undefined;
  orientation: "vertical" | "horizontal";
  disabled: boolean;
};

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
  orientation,
  disabled,
}: InterfaceSliderProps) {
  const handleSliderChange = (event: any, newValue: number) => {
    //if min
    if (index === 3) {
      const accessibleMax = values[focused][4]-1;
      if (newValue >= accessibleMax) {
        newValue = accessibleMax;
      }
    }

    //if max
    if (index === 4) {
      if (newValue <= values[focused][3] + 1) {
        newValue = values[focused][3] + 1;
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
    if (index === 4) {
      resetValue = 127;
    } 
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
    <div
      className={`bg-s-bg-light flex rounded-full ${
        orientation === "vertical" ? "w-4 py-3 flex-col" : "h-4 px-3 flex-row"
      } items-center`}
    >
      <Slider
        aria-label={label}
        value={values[focused][index]}
        min={min}
        max={max}
        step={step}
        // @ts-ignore
        onChange={handleSliderChange}
        onDoubleClick={handleReset}
        track={direction}
        orientation={orientation}
        slotProps={{
          rail: { className: direction === "normal" ? "rail" : "track"},
          track: { className: direction === "normal" ? "track" : "rail" },
          thumb: { className: "thumb" },
          root: { className: orientation === "horizontal" ? "horizontalSlider" : "verticalSlider" },
        }}
        disabled={disabled}
      />
    </div>
  );
}

export { InterfaceSlider };
