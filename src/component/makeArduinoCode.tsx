async function checkDataDirectory() {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  const appDataPath = await path.appDataDir();
  const directoryExists = await fs.exists(appDataPath);

  if (!directoryExists) {
    await fs.createDir(appDataPath);
  }

  const presetsPath = `${appDataPath}/presets`;
  const presetsExists = await fs.exists(presetsPath);

  if (!presetsExists) {
    await fs.createDir(presetsPath);
    console.log("Directory created successfully!");
  }
}

export async function readFile() {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    await checkDataDirectory();
    const appDataPath = await path.appDataDir();

    const filePath = `${appDataPath}/presets/main.ino`;
    await fs.writeFile(filePath, "test1212");

    console.log("File created successfully!");
  } catch (error) {
    console.error("Error creating file:", error);
  }
}

async function createPresetFolder(name: string) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    await checkDataDirectory();
    const appDataPath = await path.appDataDir();

    const presetPath = `${appDataPath}presets/${name}`;
    console.log(presetPath);
    const presetExists = await fs.exists(presetPath);
    if (!presetExists) {
      await fs.createDir(presetPath);
      console.log("Preset folder created successfully");
    } else {
      console.log("Preset folder already exists");
    }
  } catch (error) {
    console.error("Error creating file:", error);
  }
}

type FilesProps = {
  name: string;
  values: Array<Array<number>>;
};

async function createValuesFile({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.txt`;

    await fs.writeFile(filePath, values.toString());
  } catch (error) {
    console.error("Error creating file:", error);
  }
}

type readValuesFileProps = {
  name: string;
  defaultValues: Array<Array<number>>;
};

export async function readValuesFile({ name, defaultValues }: readValuesFileProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.txt`;
    const fileExists = await fs.exists(filePath);

    if (fileExists) {
      const valuesRaw = await fs.readTextFile(filePath);
      const valuesRawList = valuesRaw.split(",");
      const valuesList = [];

      for (let i = 0; valuesRawList.length; i += 6) {
        valuesList.push(valuesRawList.slice(i, i + 5));
      }
      console.log(valuesList)
      return valuesList;
    } else {
      console.log("File doesn't exist or empty. Return default preset");
      return defaultValues;
    }
  } catch (error) {
    console.error("Error creating file:", error);
  }
}

async function createInoFile({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.ino`;

    const code = createCode(values);
    await fs.writeFile(filePath, code);
  } catch (err) {
    console.error(err);
  }
}

function createCode(values: Array<Array<number>>) {
  const header = `#include "MIDIUSB.h" \n const int values[][6] = {`;
  const valuesList = values.map((item) => `{${item.join(", ")}}`).join(",");
  const endValueList = "};\n";
  const endCode = `
  const int NPots = 7;
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
  }`;

  const code = header + valuesList + endValueList + endCode;
  return code;
}

export async function createPreset({ name, values }: FilesProps) {
  await createPresetFolder(name);
  await createInoFile({ name, values });
  await createValuesFile({ name, values });
}
