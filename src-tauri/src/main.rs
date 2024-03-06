// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fs_extra::dir::{copy, CopyOptions};
use std::path::Path;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};


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

fn create_app_menu() -> Menu {
    return Menu::new()
        .add_submenu(Submenu::new(
            "App",
            Menu::new().add_native_item(MenuItem::Quit),
        ))
        .add_submenu(Submenu::new(
            "File",
            Menu::new()
                .add_item(CustomMenuItem::new("new".to_string(), "New").accelerator("CmdOrCtrl+N"))
                .add_item(CustomMenuItem::new("open".to_string(), "Open").accelerator("CmdOrCtrl+O"))
                .add_native_item(MenuItem::Separator)
                .add_item(CustomMenuItem::new("save".to_string(), "Save").accelerator("CmdOrCtrl+S")),
        ));
}

fn main() {
    tauri::Builder::default()
        .menu(create_app_menu())
        .on_menu_event(|event| match event.menu_item_id() {
            "new" => {
                event.window().emit("new-content", "").unwrap();
            }
            "open" => {
                event.window().emit("open-file", "").unwrap();
            }
            "save" => {
                event.window().emit("save-content", "").unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![copy_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

