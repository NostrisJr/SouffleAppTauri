import { logError, logMessage } from "./DebuggingMode";
import { checkDataDirectory } from "./HandleData";
import yaml from "js-yaml";

async function copyDir(fromPath: string, toPath: string) {
  const tauri = await import("@tauri-apps/api/tauri");
  const fs = await import("@tauri-apps/api/fs");

  try {
    logMessage("copying directory from " + fromPath + " to " + toPath + "...");

    const efp = await fs.exists(fromPath);
    const etp = await fs.exists(toPath);
    logMessage("fromPathExists = " + efp + "\ntoPathExists = " + etp);

    await tauri.invoke("copy_directory", { from: fromPath, to: toPath });

    logMessage("Resources directory written successfully");
  } catch (err) {
    logError("An error occurred while copying resources directory : " + err);
  }
}

async function formateArduinoCliConfig() {
  const path = await import("@tauri-apps/api/path");
  const fs = await import("@tauri-apps/api/fs");

  const appDataPath = await path.appDataDir();
  const configPath = `${appDataPath}Resources/Arduino15/arduino-cli.yaml`;
  const configExists = await fs.exists(configPath);

  const defaultConfigPath = await path.resolveResource(
    "Resources/Arduino15/arduino-cli.yaml"
  );

  if (configExists) {
    try {
      await fs.removeFile(configPath);
      logMessage("Existing arduino-cli config removed");
    } catch (err) {
      logError(
        "An error occurred while removing existing arduino-cli config : " + err
      );
    }
  }

  try {
    let doc = yaml.load(await fs.readTextFile(defaultConfigPath));

    const dataPath = `${appDataPath}Resources/Arduino15`;
    const downloadsPath = `${appDataPath}Resources/Arduino15/staging`;
    const userPath = `${appDataPath}Resources/Arduino`;

    // @ts-expect-error
    doc.directories.data = dataPath;
    // @ts-expect-error
    doc.directories.downloads = downloadsPath;
    // @ts-expect-error
    doc.directories.user = userPath;

    await fs.writeTextFile(configPath, yaml.dump(doc));
    logMessage(
      "New arduino-cli.yaml sucessfully writen with paths :\n data : " +
        dataPath +
        "\ndownloads : " +
        downloadsPath +
        "\nuser : " +
        userPath
    );
  } catch (err) {
    logError("An error occurred while reseting arduino-cli config : " + err);
  }
}

//BE CAREFULL !! This function calls checkDataDirectory. Don't do anything silly with it (infinite loop...)
//I decided to do so to prevent loosing the user's preset when it's needed to perform a Resources rebuilding
export async function checkResourcesDirectory(
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>
) {
  const fs = await import("@tauri-apps/api/fs");
  const path = await import("@tauri-apps/api/path");

  try {
    await checkDataDirectory();
    setDisabled(true);
    const resourcesDirFromPath = await path.resolveResource("Resources");

    const appDataPath = await path.appDataDir();
    const resourcesAppDir = `${appDataPath}Resources`;

    const resourcesAppDirExists = await fs.exists(resourcesAppDir);

    // Clean previous Resources directory
    if (resourcesAppDirExists) {
      try {
        await fs.removeDir(resourcesAppDir, { recursive: true });
        logMessage("Resources Directory sucessfully removed from App Data");
      } catch (err) {
        logError(
          "An error occurred while removing Resources Directory from App Data. Directory probably still incompletly removed : " +
            err
        );
      }
    } else {
      logMessage("No remaining Resources Directory found... Begin copy");
    }

    // Copy new Resources Directory
    try {
      await copyDir(resourcesDirFromPath, resourcesAppDir);
      logMessage("Resources directory was successfully copied");
    } catch (err) {
      logError("An error occurred while copying Resources directory : " + err);
    }

    // Add new Aruino-cli.yaml, with updated paths
    try {
      await formateArduinoCliConfig();
      logMessage("Arduino-cli.yaml succesfully reseted !");
    } catch (err) {
      logError("An error occurred while reseting arduino-cli.config : " + err);
    }
    // "Release lock" on UI
    setDisabled(false);
  } catch (err) {
    logError("An error occurred while reseting Resources directory : " + err);
  }
}
