import { WebviewWindow } from "@tauri-apps/api/window";

let debuggingWindow: WebviewWindow | null = null;

async function getDebuggingWindow() {
  const window = await import("@tauri-apps/api/window");

  if (!debuggingWindow) {
    debuggingWindow = await window.WebviewWindow.getByLabel("Debugging");
  }
  return debuggingWindow;
}

export async function logMessage(content: string) {
  try {
    const debugWindow = await getDebuggingWindow();

    if (debugWindow) {
      debugWindow.emit("log", { type: "message", content: `${content}` });
      console.log(content + " (emitted successfully)");
    } else {
      console.log(content + " (debugging window not opened)");
    }
  } catch (error) {
    console.error("Error logging message:", error);
  }
}

export async function logError(content: any) {
  try {
    const debugWindow = await getDebuggingWindow();

    if (debugWindow) {
      debugWindow.emit("log", { type: "error", content: `${content}` });
      console.error(content + " (emitted successfully)");
    } else {
      console.error(content + " (debugging window not opened)");
    }
  } catch (error) {
    console.error("Error logging message:", error);
  }
}
