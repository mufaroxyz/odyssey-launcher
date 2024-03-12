// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod lib;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::hello_world::hello_world,
            commands::io::find_installation_path,
            commands::io::ensure_installation_path,
            commands::io::fetch_local_manifest,
            commands::assets::scrape_banner
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
