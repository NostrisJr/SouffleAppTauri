import next from "next";

//also defined in Page.tsx
const nbInterfaces = 15;

//based on Spitfire libraries, also defined in page.tsx since import caused bugs
const defaultValues = [
  [1, 1, 7, 0, 127, 0, 0], //plugin volume
  [2, 1, 16, 0, 127, 0, 0], //speed/tightness
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

export async function checkDataDirectory() {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  const appDataPath = await path.appDataDir();
  const directoryExists = await fs.exists(appDataPath);

  if (!directoryExists) {
    try {
      await fs.createDir(appDataPath);
      console.log("Data directory created successfully!")
    } catch (err) {
      console.error("Error while creating Data directory : " + err)
    }
  }

  const presetsPath = `${appDataPath}/presets`;
  const presetsExists = await fs.exists(presetsPath);

  if (!presetsExists) {
    try {
      await fs.createDir(presetsPath);
      console.log("Presets directory created successfully!");
    } catch (err) {
      console.error("Error while creating presets directory : " + err)
    }
  }

  const tmpPath = `${appDataPath}/tmp`;
  const tmpExists = await fs.exists(tmpPath);

  if (!tmpExists) {
    try {
      await fs.createDir(tmpPath);
      console.log("Tmp directory created successfully!");
    } catch (err) {
      console.error("Error while creating tmp directory : " + err)
    }
  }

  const presetsInventoryPath = `${appDataPath}/presets/inventory.txt`
  const presetsInventoryExists = await fs.exists(presetsInventoryPath);

  if (!presetsInventoryExists) {
    try {
      await fs.writeFile(presetsInventoryPath, "")
      console.log("Presets inventory created successfully!");
    } catch (err) {
      console.error("Error while creating presets inventory : " + err)
    }
  }

  const defaultPresetPath = `${appDataPath}/presets/default`
  const defaultPresetExists = await fs.exists(defaultPresetPath);

  if (!defaultPresetExists) {
    try {
      await createPreset({ name: "Default", values: defaultValues, init: true })
      console.log("Default preset created successfully!");
    } catch (err) {
      console.error("Error while creating Default preset : " + err)
    }
  }

}

async function createPresetFolder(name: string) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();

    const presetPath = `${appDataPath}presets/${name}`;
    console.log(presetPath);
    const presetExists = await fs.exists(presetPath);
    if (!presetExists) {
      await fs.createDir(presetPath);
      console.log(name + " preset folder created successfully");
      return true
    } else {
      console.error(name + "preset folder already exists");
      return false
    }
  } catch (error) {
    console.error("Error while creating " + name + "preset folder:", error);
    return false
  }
}

type FilesProps = {
  name: string;
  values: Array<Array<number>>;
  init?: boolean;
};

async function createValuesFile({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.txt`;

    await fs.writeFile(filePath, values.toString());
    console.log(name + "'s values file created successfully")
  } catch (err) {
    console.error("Error creating values file for " + name + " preset, with values :\n " + values + "\nError : ", err);
  }
};

export async function readValuesFile(name: string) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.txt`;
    const fileExists = await fs.exists(filePath);

    if (fileExists) {
      const valuesRaw = await fs.readTextFile(filePath);
      const valuesRawList = valuesRaw.split(",");
      let valuesList = [];

      if (valuesRawList.length === defaultValues.toString().split(",").length) {
        for (let i = 0; i < nbInterfaces; i++) {
          let potValues = []
          for (let j = i * 7; j < i * 7 + 7; j++) {
            const value = parseInt(valuesRawList[j]);
            if (!isNaN(value)) {
              potValues.push(value);
            } else {
              console.error("Failed to parse value at index ${j}");
            }
          }
          valuesList.push(potValues);
        }
        console.log(name + "'s values file read successfully")
        return valuesList;
      }
    } else {
      console.error(name + "'s values file doesn't exist or invalid. Return default preset");
      return defaultValues;
    }
  } catch (err) {
    console.error("Error while reading " + name + "'s values file : ", err);
  }
  return defaultValues;
};

async function createInoFile({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.ino`;

    const code = await createCode(values);

    if (code === false) {
      throw new Error('Arduino code invalid. Cannot create ino file (code = false)');
    }

    await fs.writeTextFile(filePath, code);
    console.log(name + "'s ino file created successfully")
  } catch (err) {
    console.error("Error creating ino file for " + name + " preset, with values :\n " + values + "\nError : ", err);
  }
};

type tempInoProps = {
  name: string;
  values: Array<Array<number>>;
}

export async function createTempInoFile({ name, values }: tempInoProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  const appDataPath = await path.appDataDir();


  try {

    const folderPath = `${appDataPath}tmp/sketch_${name}`;

    await fs.createDir(folderPath);
    console.log(name + " preset folder created successfully");

    const filePath = `${appDataPath}tmp/sketch_${name}/sketch_${name}.ino`;

    const code = await createCode(values);

    if (code === false) {
      throw new Error('Arduino code invalid. Cannot create ino file (code === false)');
    }

    await fs.writeTextFile(filePath, code);
    console.log("temporary ino file created successfully")

  } catch (err) {
    console.error("Error creating temporary ino file, with values :\n " + values + "\nError : ", err);
  }
};

export async function clearTmpFiles() {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const pathTmpFolder = `${appDataPath}tmp/`

    await fs.removeDir(pathTmpFolder, { recursive: true })
    await fs.createDir(pathTmpFolder)
    console.log("Tmp folder cleaned sucessfully")
  } catch (err) {
    await checkDataDirectory();
    console.error("An error occured while cleaning Tmp folder : " + err)
  }
};

async function createCode(values: Array<Array<number>>) {
  const pathModule = await import("@tauri-apps/api/path");
  const pathDefaultSketch = await pathModule.resolveResource("resources/Arduino/sketch_default/sketch_default.ino");
  const fs = await import("@tauri-apps/api/fs");

  try {
    const defaultCode = await fs.readTextFile(pathDefaultSketch)
    let splitedCode = defaultCode.split("\n")

    //Go see the default code to understand/debug this
    const index = splitedCode.indexOf("// DO NOT REMOVE COMMENTARY - Next line is values") + 1;

    const valuesList = "const int values[15][7] = {" + values.map((item) => `{${item.join(", ")}}`).join(",") + "};";
    splitedCode[index] = valuesList

    let newCode = ""
    console.log(index)
    console.log(splitedCode)

    for (let i = 0; i < splitedCode.length; i++) {
      newCode = newCode + splitedCode[i] + "\n"
    }
    console.log(newCode)
    return (newCode)
  } catch (err) {
    console.error("An error occured while creating arduino code from values : " + values)
    return (false)
  }
}

export async function createPreset({ name, values, init }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");
  const dialog = await import("@tauri-apps/api/dialog")

  //avoid to show a completion message when createPreset is called by checkDataDirectory's creation of Default preset
  let showCompletionMessage = true
  if (init === true) {
    showCompletionMessage = false
  }

  const finalName = name.charAt(0).toUpperCase() + name.slice(1)

  try {

    //creates an infinite loop otherwise
    if (init !== true) {
      await checkDataDirectory()
    }

    await createPresetFolder(finalName);
    await createInoFile({ name: finalName, values });
    await createValuesFile({ name: finalName, values });
    const appDataPath = await path.appDataDir();
    const presetsInventoryPath = `${appDataPath}/presets/inventory.txt`

    let inventory = await fs.readTextFile(presetsInventoryPath)
    inventory += `${finalName}\n`
    await fs.writeTextFile(presetsInventoryPath, inventory)
    console.log("Preset " + name + " created sucessfully !")
    if (showCompletionMessage) {
      await dialog.message("Preset " + finalName + " created sucessfully !")
    }
  } catch (err) { console.log("An error occured while creating preset " + name + " with values : " + values + "\nError : " + err) }
}

export async function deletePreset(name: string) {
  const dialog = await import("@tauri-apps/api/dialog")

  try {
    const fs = await import("@tauri-apps/api/fs");
    const path = await import("@tauri-apps/api/path");

    const appDataPath = await path.appDataDir();
    const presetDirectory = `${appDataPath}presets/${name}`
    const presetsInventoryPath = `${appDataPath}presets/inventory.txt`

    await fs.removeDir(presetDirectory, { recursive: true });

    const inventoryRaw = await fs.readTextFile(presetsInventoryPath);
    const inventory = inventoryRaw.split("\n").filter((presetName: string) => presetName.toLowerCase() !== name.toLowerCase()).join("\n")

    await fs.writeTextFile(presetsInventoryPath, inventory);

    await dialog.message(name + " preset deleted successfully !")
    console.log(name + " preset deleted successfully !")
  } catch (err) {
    console.log("An error occured : " + err)
    await dialog.message("An error occured while deleting " + name + " preset...\n Error : " + err)

  }
}
