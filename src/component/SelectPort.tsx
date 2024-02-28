import React, { useState } from "react";

type selectPortProps = {
  ports: Array<Array<string>>;
  selectedDevice: Array<string>;
  setSelectedDevice: React.Dispatch<React.SetStateAction<Array<string>>>;
  className: string;
  disabled: boolean;
};

function SelectPort({ ports, selectedDevice, setSelectedDevice, className, disabled }: selectPortProps) {
  const [selectedValue, setSelectedValue] = useState<Array<string>>(selectedDevice);

  function handleSelectChange(event: any) {
    const newDevice = event.target.value.split(",");
    console.log(newDevice)
    setSelectedValue(newDevice);
    setSelectedDevice(newDevice);
  }

  return (
    <select value={selectedValue} onChange={handleSelectChange} className={className} disabled={disabled}>
      <option value="">Please select a device</option>
      {ports.map((port, index) => (
        <option key={index} value={port} className="text-center justify-center">
          {port[1]}
        </option>
      ))}
    </select>
  );
}

export { SelectPort };
