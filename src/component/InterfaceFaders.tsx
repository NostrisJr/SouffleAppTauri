import React from "react";

type fadersProp = {
  interfaceId: number;
  colors: Array<Array<string>>;
  handlePotClick: ({ interfaceId, potId }: handlePotClickProp) => void;
};

type handlePotClickProp = {
  interfaceId: number;
  potId: number;
};

function InterfaceFaders({ interfaceId, colors, handlePotClick }: fadersProp) {
  return (
    <g>
      {/* F1 */}
      <g onClick={() => handlePotClick({ interfaceId, potId: 5 })}>
        <path
          d="M4427.35 2992.23c.38 0 .68 1.64.68 3.68v.97c0 2.04-.3 3.68-.68 3.68h-48.85c-.37 0-.68-1.64-.68-3.68v-.97c0-2.04.31-3.68.68-3.68h48.85Z"
          style={{
            fill: colors[interfaceId][5],
          }}
          transform="matrix(0 -4.22613 .77954 0 -2270.708 18729.052)"
        />
        <path
          d="M4497.66 2984.93c.99 0 1.94.36 2.65 1.01.7.66 1.09 1.54 1.09 2.46v27.76c0 .92-.39 1.8-1.09 2.46-.71.65-1.66 1.01-2.65 1.01h-11.59c-.99 0-1.94-.36-2.64-1.01-.7-.66-1.1-1.54-1.1-2.46v-27.76c0-.92.4-1.8 1.1-2.46.7-.65 1.65-1.01 2.64-1.01h11.59Z"
          style={{
            fill: colors[interfaceId][5],
          }}
          transform="matrix(1.01193 0 0 1.0885 -4480.338 -3107.403)"
        />
      </g>
      {/* F2 */}
      <g onClick={() => handlePotClick({ interfaceId, potId: 6 })}>
        <path
          d="M4427.35 2992.23c.38 0 .68 1.64.68 3.68v.97c0 2.04-.3 3.68-.68 3.68h-48.85c-.37 0-.68-1.64-.68-3.68v-.97c0-2.04.31-3.68.68-3.68h48.85Z"
          style={{
            fill: colors[interfaceId][6],
          }}
          transform="matrix(0 -4.22613 .77954 0 -2233.75 18729.052)"
        />
        <path
          d="M4497.66 2984.93c.99 0 1.94.36 2.65 1.01.7.66 1.09 1.54 1.09 2.46v27.76c0 .92-.39 1.8-1.09 2.46-.71.65-1.66 1.01-2.65 1.01h-11.59c-.99 0-1.94-.36-2.64-1.01-.7-.66-1.1-1.54-1.1-2.46v-27.76c0-.92.4-1.8 1.1-2.46.7-.65 1.65-1.01 2.64-1.01h11.59Z"
          style={{
            fill: colors[interfaceId][6],
          }}
          transform="matrix(1.01193 0 0 1.0885 -4443.357 -3150.071)"
        />
      </g>
      {/* F3 */}
      <g onClick={() => handlePotClick({ interfaceId, potId: 7 })}>
        <path
          d="M4427.35 2992.23c.38 0 .68 1.64.68 3.67v.99c0 2.03-.3 3.67-.68 3.67h-48.85c-.37 0-.68-1.64-.68-3.67v-.99c0-2.03.31-3.67.68-3.67h48.85Z"
          style={{
            fill: colors[interfaceId][7],
          }}
          transform="matrix(0 -4.22613 .78074 0 -2200.395 18729.106)"
        />
        <path
          d="M4497.66 2984.93c.99 0 1.94.36 2.65 1.01.7.66 1.09 1.54 1.09 2.46v27.76c0 .92-.39 1.8-1.09 2.46-.71.65-1.66 1.01-2.65 1.01h-11.59c-.99 0-1.94-.36-2.64-1.01-.7-.66-1.1-1.54-1.1-2.46v-27.76c0-.92.4-1.8 1.1-2.46.7-.65 1.65-1.01 2.64-1.01h11.59Z"
          style={{
            fill: colors[interfaceId][7],
          }}
          transform="matrix(1.01193 0 0 1.0885 -4406.416 -3119.037)"
        />
      </g>
    </g>
  );
}

export { InterfaceFaders };
