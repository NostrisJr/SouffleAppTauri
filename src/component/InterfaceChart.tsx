import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { InputNumber } from "./InputNumber";
import { InterfaceSlider } from "./InterfaceSlider";

type chartProp = {
  bend: number;
  min: number;
  max: number;
  colorFill: Array<string>;
  values: Array<Array<number>>;
  setValues: React.Dispatch<React.SetStateAction<number[][]>>;
  focused: number;
  className: string;
  disabled: boolean;
};

function InterfaceChart({ bend, min, max, colorFill, values, setValues, focused, className, disabled }: chartProp) {

  const data = [];

  for (let x = 0; x < min; x += 1) {
    data.push({ x: x, y: min });
  }
  for (let x = min; x <= max; x += 1) {
    /*Let's work between 0 and 1*/
    let newX = (x - min) / (max - min);
    let newY = Math.pow(newX, Math.exp(bend / 100));

    data.push({ x: x, y: newY * (max - min) + min });
  }
  for (let x = max; x <= 127; x += 1) {
    data.push({ x: x, y: max });
  }

  return (
    <div className={className}>
      <div className="flex h-full pt-20 pb-10 pr-4">
        <InterfaceSlider
          label="min"
          index={3}
          focused={focused}
          values={values}
          setValues={setValues}
          min={0}
          max={127}
          step={1}
          direction="normal"
          orientation="vertical"
          disabled={disabled}
        />
      </div>
      <div className="w-full">
        <div className="bg-s-bg-light grid grid-cols-2 gap-4 font-body font-medium text-xl p-5 w-full">
          <div className=" col-span-1 flex items-center">
            <p className="text-s-bg-dark">Canal :</p>
            <InputNumber
              className="bg-s-bg-light w-20 h-8 border-none outline-none caret-s-white text-xl text-s-white mx-2 rounded-lg px-2"
              min={1}
              max={16}
              step={1}
              index={1}
              values={values}
              setValues={setValues}
              focused={focused}
            />
          </div>
          <div className=" col-span-1 flex items-center">
            <p className="text-s-bg-dark">Mici CC : </p>
            <InputNumber
              className="bg-s-bg-light w-20 h-8 border-none outline-none caret-s-white text-xl text-s-white mx-2 rounded-lg px-2"
              min={1}
              max={127}
              step={1}
              index={2}
              values={values}
              setValues={setValues}
              focused={focused}
            />
          </div>

          <div className="bg-s-pink h-[.1em] col-span-2 noFadeIn" />
          <div className="bg-s-bg-dark p-2 col-span-2 w-full aspect-[10/8] noFadeIn">
            <ResponsiveContainer width="100%" height="100%" className="col-span-2 noFadeIn">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey={"x"} domain={[0, 127]} ticks={[0, 127]}/>
                <YAxis dataKey={"y"} domain={[0, 127]} ticks={[min, max]}/>
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={colorFill[2]}
                  dot={false}
                  className="noFadeIn"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-4 px-4 ">
          <InterfaceSlider
            label="bend"
            index={5}
            focused={focused}
            values={values}
            setValues={setValues}
            min={-300}
            max={300}
            step={1}
            direction="normal"
            orientation="horizontal"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex h-full pt-20 pb-10 pl-4">
        <InterfaceSlider
          label="max"
          index={4}
          focused={focused}
          values={values}
          setValues={setValues}
          min={0}
          max={127}
          step={1}
          direction="inverted"
          orientation="vertical"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export { InterfaceChart };
