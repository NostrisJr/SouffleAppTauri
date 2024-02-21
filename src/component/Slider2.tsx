import React from "react";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";

const InvertedSlider = styled(Slider)({
  direction: "ltr", // Setting the direction to right-to-left
  "& .MuiSlider-rail": {
    // Styles for the rail
    backgroundColor: "#e0e0e0",
  },
  "& .MuiSlider-track": {
    // Styles for the track
    backgroundColor: "#3f51b5",
  },
  "& .MuiSlider-thumb": {
    // Styles for the thumb
    backgroundColor: "#3f51b5",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0px 0px 0px 8px rgba(63, 81, 181, 0.16)", // Adding a hover effect
    },
  },
});

interface InvertedSliderProps {
  value: number;
  onChange: (event: Event, value: number | number[]) => void;
}

const Slider2 : React.FC<InvertedSliderProps> = () => {
  return (
    <InvertedSlider
      defaultValue={0} // Default value set to 0
      min={0}
      max={127}
      step={1}
      valueLabelDisplay="auto"
      track="inverted"
  
    />
  );
};

export default Slider2;