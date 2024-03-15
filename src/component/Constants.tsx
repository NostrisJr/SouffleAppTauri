import { useState } from "react";

export const NB_INTERFACES: number = 15;

//based on Spitfire libraries
export const DEFAULT_VALUES: Array<Array<number>> = [
  [1, 1, 7, 0, 127, 0, 0], //plugin volume
  [2, 1, 18, 0, 127, 0, 0], //speed/tightness
  [3, 1, 17, 0, 127, 0, 0], // release
  [4, 1, 19, 0, 127, 0, 0], //reverb
  [5, 1, 11, 0, 127, 0, 0], //expression
  [6, 1, 1, 0, 127, 0, 0], //dynamics
  [7, 1, 21, 0, 127, 0, 0], // vibrato
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
  [-1, 1, 0, 0, 127, 0, 0],
];
