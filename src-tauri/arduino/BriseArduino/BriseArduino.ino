#include "MIDIUSB.h"

const int NPots = 7;
//values
const int values[][6] = {
    {1, 1, 7, 0, 127, 0},   // plugin volume
    {2, 1, 16, 0, 127, 0},  // speed/tightness
    {3, 1, 17, 0, 127, 0},  // release
    {4, 1, 19, 0, 127, 0},  // reverb
    {5, 1, 11, 0, 127, 0},  // expression
    {6, 1, 1, 0, 127, 0},   // dynamics
    {7, 1, 21, 0, 127, 0},  // vibrato
    {-1, 1, 0, 0, 127, 0},  // filler values
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
    {-1, 1, 0, 0, 127, 0},
};

// POTENTIOMETERS
const int potPin[NPots] = {A8, A7, A6, A0, A1, A2, A3};
int potCState[NPots] = {0};
int potPState[NPots] = {0};
int potVar = 0;

int midiCState[NPots] = {0};
int midiPState[NPots] = {0};

const int TIMEOUT = 300;
const int varThreshold = 10;
boolean potMoving = true;
unsigned long PTime[NPots] = {0};
unsigned long timer[NPots] = {0};

// MIDI Assignments 
int midiCh[NPots] = {values[0][1], values[1][1], values[2][1], values[3][1], values[4][1], values[5][1], values[6][1]};
int cc[NPots] = {values[0][0], values[1][0], values[2][0], values[3][0], values[4][0], values[5][0], values[6][0]};


void setup() {
}

void loop() {
  potentiometers();
}


void potentiometers() {

  for (int i = 0; i < NPots; i++) {

    potCState[i] = analogRead(potPin[i]);

    midiCState[i] = map(potCState[i], 0, 1023, 127, 0); // map(value, fromLow, fromHigh, toLow, toHigh)

    potVar = abs(potCState[i] - potPState[i]);

    if (potVar > varThreshold) {
      PTime[i] = millis();
    }

    timer[i] = millis() - PTime[i];

    if (timer[i] < TIMEOUT) {
      potMoving = true;
    }
    else {
      potMoving = false;
    }

    if (potMoving == true) {
      if (midiPState[i] != midiCState[i]) {

        controlChange(midiCh[i], cc[i], midiCState[i]);
        MidiUSB.flush();

        potPState[i] = potCState[i];
        midiPState[i] = midiCState[i];
      }
    }
  }
}

void controlChange(byte channel, byte control, byte value) {
  midiEventPacket_t event = {0x0B, 0xB0 | channel, control, value};
  MidiUSB.sendMIDI(event);
}

int calcValue(int value, int min, int max, int bend) {
  if (value < min) {
    return min;
  }
  if (min <= value && value <= max) {
    // Let's work between 0 and 1
    float newX = float(value - min) / float(max - min);
    float newY = pow(newX, exp(float(bend) / 100.0));

    return int(newY * (max - min) + min);
  }
  else {
    return max;
  }
}


