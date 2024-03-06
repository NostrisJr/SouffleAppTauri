import error from "next/error";

export async function logMessage(content: string) {
    const window = await import("@tauri-apps/api/window")

    const debuggingWindow = window.WebviewWindow.getByLabel('Debugging');
    if (debuggingWindow){
        debuggingWindow.emit("log",{type:"message", content:`${content}`})
        console.log(content+"(emmited successfully)")
    } else{
        console.log(content+"(debugging window not opened)")
    }
}

export async function logError(content: any) {
    const window = await import("@tauri-apps/api/window")

    const debuggingWindow = window.WebviewWindow.getByLabel('Debugging');
    if (debuggingWindow){
        debuggingWindow.emit("log",{type:"error", content:`${content}`})
        console.error(content+"(emmited successfully)")
    } else{
        console.error(content+"(debugging window not opened)")
    }
}