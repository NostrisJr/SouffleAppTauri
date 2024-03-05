export async function logMessage(message: string) {
    const window = await import("@tauri-apps/api/window")

    const debuggingWindow = window.WebviewWindow.getByLabel('Debugging');
    if (debuggingWindow){
        debuggingWindow.emit("log",{message:`${message}`})
        console.log(message+"(emmited successfully)")
    } else{
        console.log(message+"(debugging window not opened)")
    }
}

export async function logError(message: string) {
    const window = await import("@tauri-apps/api/window")

    const debuggingWindow = window.WebviewWindow.getByLabel('Debugging');
    if (debuggingWindow){
        debuggingWindow.emit("log",{error:`${message}`})
        console.error(message+"(emmited successfully)")
    } else{
        console.error(message+"(debugging window not opened)")
    }
}