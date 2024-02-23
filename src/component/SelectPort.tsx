import React, { useState } from "react";

type selectPortProps = {
  ports: Array<string>;
  selectedPort: string;
  setSelectedPort: React.Dispatch<React.SetStateAction<string>>;
  className: string;
};

function SelectPort({ ports, selectedPort, setSelectedPort, className }: selectPortProps) {
  const [selectedValue, setSelectedValue] = useState<string>(selectedPort);

  function handleSelectChange(event: any) {
    const newPort = event.target.value;
    setSelectedValue(newPort);
    setSelectedPort(newPort);
  }

  return (
    <select value={selectedValue} onChange={handleSelectChange} className={className}>
      <option value="">Please select a device</option>
      {ports.map(
        (port, index) =>
          port !== "" && (
            <option key={index} value={port} className="text-center justify-center">
              {port}
            </option>
          )
      )}
    </select>
  );
}

export { SelectPort };
