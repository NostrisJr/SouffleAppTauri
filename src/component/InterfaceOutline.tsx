type outlineProp = {
  interfaceId: number;
  colors: Array<Array<string>>;
  handleOutlineClick: (id: number) => void;
};

function InterfaceOutline({
  interfaceId,
  colors,
  handleOutlineClick,
}: outlineProp) {
  return (
    <g>
      <path
        d="M6205.49 4093.01v1537.86c0 38.3-30.78 69.65-69.07 69.65h-943.77c-38.3 0-69.07-31.35-69.07-69.65V4093.01c0-38.3 30.77-69.65 69.07-69.65h943.77c38.29 0 69.07 31.35 69.07 69.65Z"
        style={{
          fill: colors[interfaceId][0],
          fillOpacity: "0",
        }}
        transform="matrix(.15402 0 0 .14515 -789.154 -584)"
        onClick={() => handleOutlineClick(interfaceId)}
      />
      <path
        d="M6205.49 4093.01v1537.86c0 38.3-30.78 69.65-69.07 69.65h-943.77c-38.3 0-69.07-31.35-69.07-69.65V4093.01c0-38.3 30.77-69.65 69.07-69.65h943.77c38.29 0 69.07 31.35 69.07 69.65Zm-18.92 0c0-27.55-22.6-49.58-50.15-49.58h-943.77c-27.55 0-50.16 22.03-50.16 49.58v1537.86c0 27.55 22.61 49.58 50.16 49.58h943.77c27.55 0 50.15-22.03 50.15-49.58V4093.01Z"
        style={{
          fill: colors[interfaceId][0],
        }}
        transform="matrix(.15402 0 0 .14515 -789.154 -584)"
        onClick={() => handleOutlineClick(interfaceId)}
      />
    </g>
  );
}

export { InterfaceOutline };
