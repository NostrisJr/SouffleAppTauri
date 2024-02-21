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
};

function InterfaceChart({ bend, min, max, colorFill, values, setValues, focused, className }: chartProp) {
  const realMax = 127 - max;

  const data = [];

  for (let x = 0; x < min; x += 1) {
    data.push({ x: x, y: min });
  }
  for (let x = min; x <= realMax; x += 1) {
    /*Let's work between 0 and 1*/
    let newX = (x - min) / (realMax - min);
    let newY = Math.pow(newX, Math.exp(bend / 100));

    data.push({ x: x, y: newY * (realMax - min) + min });
  }
  for (let x = realMax; x <= 127; x += 1) {
    data.push({ x: x, y: realMax });
  }

  return (
    <div className={className}>
      <div className="w-full noFadeIn">
        <div className="bg-s-bg-light grid grid-cols-2 gap-5 font-body font-medium text-xl p-5 w-full">
          <div className=" col-span-1 flex items-center">
            <p className="text-s-bg-dark">Canal : </p>
            <InputNumber
              className="bg-s-bg-light w-20 h-8 border-none focus:ring-0 text-xl text-s-white"
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
              className="bg-s-bg-light w-20 h-8 border-none focus:ring-0 text-xl text-s-white"
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
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} className="noFadeIn">
                <XAxis dataKey={"x"} domain={[0, 127]} ticks={[0, 127]} className="noFadeIn" />
                <YAxis dataKey={"y"} domain={[0, 127]} ticks={[min, realMax]} className="noFadeIn" />
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
          />

          <div className="px-10 py-4">
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
            />
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { InterfaceChart };
