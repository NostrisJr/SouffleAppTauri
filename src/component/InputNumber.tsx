import { useState } from "react";

type inputNumberProp = {
  min: number;
  max: number;
  step: number;
  index: number;
  values: Array<Array<number>>;
  setValues: React.Dispatch<React.SetStateAction<number[][]>>;
  focused: number;
  className: string;
};

function InputNumber({
  className,
  min,
  max,
  step,
  index,
  values,
  setValues,
  focused,
}: inputNumberProp) {
  const handleChange = (newParam: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(newParam.target.value);

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

  const checkValue = (newParam: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(newParam.target.value);

    if (
      newValue < min ||
      newValue > max ||
      !Number.isInteger(newValue) ||
      isNaN(newValue)
    ) {
      newValue = 1;

      const nextValues = values.map((parameters, i) => {
        if (i === focused) {
          parameters[index] = newValue;
          return parameters;
        } else {
          return parameters;
        }
      });
      setValues(nextValues);
    }
  };

  return (
    <>
      <input
        className={className}
        type="number"
        min={min}
        max={max}
        step={step}
        value={values[focused][index]}
        onChange={handleChange}
        onBlur={checkValue}
      />
    </>
  );
}

export { InputNumber };
