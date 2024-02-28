//based on Spitfire libraries
export const defaultValues = [
  [1, 1, 7, 0, 127, 0], //plugin volume
  [2, 1, 16, 0, 127, 0], //speed/tightness
  [3, 1, 17, 0, 127, 0], // release
  [4, 1, 19, 0, 127, 0], //reverb
  [5, 1, 11, 0, 127, 0], //expression
  [6, 1, 1, 0, 127, 0], //dynamics
  [7, 1, 21, 0, 127, 0], // vibrato
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
  [-1, 1, 0, 0, 127, 0],
];


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

  const presetsInventoryPath = `${appDataPath}/presets/inventory.txt`
  const presetsInventoryExists = await fs.exists(presetsInventoryPath);

  if(!presetsInventoryExists){
    await fs.writeFile(presetsInventoryPath, "")
  }

  const defaultPresetPath = `${appDataPath}/presets/default`
  const defaultPresetExists = await fs.exists(defaultPresetPath);
  
  if(!defaultPresetExists){
    createPreset({name:"default", values: defaultValues})
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
      return true
    } else {
      console.log("Preset folder already exists");
      return false
    }
  } catch (error) {
    console.error("Error creating file:", error);
    return false
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
};

export async function readValuesFile( name:string) {
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
};

async function createInoFile({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    const appDataPath = await path.appDataDir();
    const filePath = `${appDataPath}presets/${name}/${name}.ino`;

    const code = await createCode(values);
    await fs.writeFile(filePath, code);
  } catch (err) {
    console.error(err);
  }
};

async function createCode(values: Array<Array<number>>) {
  const pathModule = await import("@tauri-apps/api/path");
  const pathDefaultSketch = await pathModule.resolveResource("resources/Arduino/sketch_default/sketch_default.ino");
  const fs = await import("@tauri-apps/api/fs");

  const defaultCode = await fs.readTextFile(pathDefaultSketch)
  const splitedCode = defaultCode.split("\n")

  //Go see the default code to understand/debug this
  const index = splitedCode.indexOf("//DO NOT REMOVE COMMENTARY - Next line is values") + 1;

  const valuesList = "const int values[][6] = {"+values.map((item) => `{${item.join(", ")}}`).join(",")+"};";
  splitedCode[index]= valuesList

  let newCode = ""

  for (let i=0; i<= splitedCode.length; i++) {
    newCode = newCode + splitedCode[i] +"\n"
  }
  return(newCode)
}

export async function createPreset({ name, values }: FilesProps) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  const creationSuccessful = await createPresetFolder(name);
  if(creationSuccessful){
    await createInoFile({ name, values });
    await createValuesFile({ name, values });
    const appDataPath = await path.appDataDir();
    const presetsInventoryPath = `${appDataPath}/presets/inventory.txt`

    let inventory = await fs.readTextFile(presetsInventoryPath)
    inventory += `${name}\n`
    await fs.writeTextFile(presetsInventoryPath, inventory )
  }
}

  