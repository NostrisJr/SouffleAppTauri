// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fs_extra::dir::{CopyOptions, copy};
use std::path::Path;

#[tauri::command]
fn copy_directory(from: String, to: String) -> Result<(), String> {
    let from_path = Path::new(&from);
    let to_path = Path::new(&to);

    let mut options = CopyOptions::new();
    options.overwrite = true;
    options.content_only = true;
    options.copy_inside = true;

    match copy(from_path, to_path, &options) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![copy_directory])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}