// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fs_extra::dir::{copy, CopyOptions};
use std::path::Path;
use tauri::{AboutMetadata, CustomMenuItem, Menu, MenuItem, Submenu};

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
    let authors = vec!["Theophile Donato".to_string()];

    let about_metadata = AboutMetadata::new()
        .authors(authors)
        .version("1.0.0")
        .comments("This is the desktop app for Souffle controlers programation.\n Find more on my website")
        .website("https://www.thisdonato.com/");

    Menu::new()
        // Add App submenu
        .add_submenu(Submenu::new(
            "App",
            Menu::new()
                .add_native_item(MenuItem::Quit)
                .add_native_item(MenuItem::About("Souffle Desktop App".to_string(), about_metadata)),
        ))
        // Add Preset submenu
        .add_submenu(Submenu::new(
            "Configuration",
            Menu::new()
                .add_item(CustomMenuItem::new("save_preset".to_string(), "Save Preset").accelerator("CmdOrCtrl+S"))
                .add_item(CustomMenuItem::new("refresh_devices".to_string(), "Refresh Devices").accelerator("CmdOrCtrl+R"))
                .add_native_item(MenuItem::Separator)
                .add_item(CustomMenuItem::new("default_values".to_string(), "Default Configuration").accelerator("CmdOrCtrl+D"))
                .add_item(CustomMenuItem::new("send_values".to_string(), "Send Configuration").accelerator("CmdOrCtrl+U")),

        ))
        .add_submenu(Submenu::new(
            "Debugging",
            Menu::new()
                .add_item(CustomMenuItem::new("debug_mode".to_string(), "Open/Close Debugging Mode").accelerator("CmdOrCtrl+O"))
                .add_item(CustomMenuItem::new("reset_resources".to_string(), "Reset App Resources"))
        ))
}

fn main() {
    tauri::Builder::default()
        .menu(create_app_menu())
        .on_menu_event(|event| match event.menu_item_id() {
            "save_preset" => {
                event.window().emit("save_preset", "").unwrap();
            }
            "refresh_devices" => {
                event.window().emit("refresh_devices", "").unwrap();
            }
            "default_values" => {
                event.window().emit("default_values", "").unwrap();
            }
            "sed_values" => {
                event.window().emit("send_values", "").unwrap();
            }
            "debug_mode" => {
                event.window().emit("debug_mode", "").unwrap();
            }
            "reset_resources" => {
                event.window().emit("reset_resources", "").unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![copy_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
