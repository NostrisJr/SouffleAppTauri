//This is the default code for Brise controller
//It is inspired by the code of the Nerd Musician (https://www.musiconerd.com/)
#include "MIDIUSB.h"

// DO NOT REMOVE COMMENTARY - Next line is values
const int values[15][7] = {{1, 1, 7, 0, 127, 0, 0}, {2, 1, 16, 0, 127, 0, 0}, {3, 1, 17, 0, 127, 0, 0}, {4, 1, 19, 0, 127, 0, 0}, {5, 1, 11, 0, 127, 0, 0}, {6, 1, 1, 0, 127, 0, 0}, {7, 1, 21, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}, {-1, 1, 0, 0, 127, 0, 0}};

const int NbInterfaces = 15;
// POTENTIOMETERS
// first 0 is for pratical purpuse : you can reat pot values[X][0] on pin potPin[values[X][0]]...
const int potPin[8] = {0, A3, A2, A1, A0, A8, A7, A6};

int potCState[NbInterfaces] = {0};
int potPState[NbInterfaces] = {0};
int potVar = 0;

int midiCState[NbInterfaces] = {0};
int midiPState[NbInterfaces] = {0};

const int TIMEOUT = 300;
const int varThreshold = 10;
boolean potMoving = true;
unsigned long PTime[NbInterfaces] = {0};
unsigned long timer[NbInterfaces] = {0};

// MIDI Assignments
int midiChanel[NbInterfaces] = {values[0][1], values[1][1], values[2][1], values[3][1], values[4][1], values[5][1], values[6][1], values[7][1], values[8][1], values[9][1], values[10][1], values[11][1], values[12][1], values[13][1], values[14][1]};
int midiCC[NbInterfaces] = {values[0][2], values[1][2], values[2][2], values[3][2], values[4][2], values[5][2], values[6][2], values[7][2], values[8][2], values[9][2], values[10][2], values[11][2], values[12][2], values[13][2], values[14][2]};

void setup()
{
}

void loop()
{
  potentiometers();
}

void potentiometers()
{

  for (int i = 0; i < NbInterfaces; i++)
  {
    if (values[i][0] != -1)
    {
      potCState[i] = analogRead(potPin[values[i][0]]);

      midiCState[i] = map(potCState[i], 0, 1023, 127, 0); // map(value, fromLow, fromHigh, toLow, toHigh). Inverted because the pcb is wrongly designed...

      potVar = abs(potCState[i] - potPState[i]);

      if (potVar > varThreshold)
      {
        PTime[i] = millis();
      }

      timer[i] = millis() - PTime[i];

      if (timer[i] < TIMEOUT)
      {
        potMoving = true;
      }
      else
      {
        potMoving = false;
      }

      if (potMoving == true)
      {
        if (midiPState[i] != midiCState[i])
        {

          controlChange(midiChanel[i], midiCC[i], calcValue(midiCState[i], values[i][3], values[i][4], values[i][5]));
          MidiUSB.flush();

          potPState[i] = potCState[i];
          midiPState[i] = midiCState[i];
        }
      }
    }
  }
}

void controlChange(byte channel, byte control, byte value)
{
  const int real_channel = channel - 1; // MIDI channels are 1-16, but the library uses 0-15. 
  //It comes from the fact that it's coded in hex... If you were to send smth on channel "16", it would send on channel 1
  midiEventPacket_t event = {0x0B, 0xB0 | real_channel, control, value};
  MidiUSB.sendMIDI(event);
}

int calcValue(int value, int min, int max, int bend)
{
  if (value < min)
  {
    return min;
  }
  if (min <= value && value <= max)
  {
    // Let's work between 0 and 1
    float newX = float(value - min) / float(max - min);
    float newY = pow(newX, exp(float(bend) / 100.0));

    return int(newY * (max - min) + min);
  }
  else
  {
    return max;
  }
}
