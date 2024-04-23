use crate::lib::asset_manager;
use crate::lib::asset_manager::Package;
use crate::lib::game_manifests;
use crate::lib::genshin_utils;

use serde_json::json;
use serde_json::Value;

#[tauri::command]
pub fn find_installation_path() -> Result<Value, Value> {
    genshin_utils::auto_detect_genshin_installation()
}

#[tauri::command]
pub fn ensure_installation_path(path: String) -> Result<Value, Value> {
    genshin_utils::ensure_installation_path(path).into()
}

#[tauri::command]
pub fn fetch_local_manifest(path: String) -> Result<Value, Value> {
    game_manifests::fetch_local_manifest(path).into()
}

#[tauri::command]
pub fn get_packages_list() -> Result<Vec<Package>, Value> {
    asset_manager::AssetManager::get_packages_list()
}

#[tauri::command]
pub fn get_executable_path() -> Result<Value, ()> {
    let binding = std::env::current_exe().unwrap();
    let exe_path = binding.parent();

    println!("Executable path: {:?}", exe_path);

    match exe_path {
        Some(path) => {
            return Ok(json!({
                "path": path.to_str().unwrap()
            })
            .into())
        }
        None => {
            println!("Failed to get executable path");
            return Err(());
        }
    }
}

#[tauri::command]
pub fn uninstall_game(path: String) -> Result<Value, Value> {
    let path = std::path::Path::new(&path);
    if path.exists() {
        std::fs::remove_dir_all(path).unwrap();
        Ok(json!({
            "status": "success"
        })
        .into())
    } else {
        Ok(json!({
            "status": "error",
            "message": "Path does not exist"
        })
        .into())
    }
}

#[tauri::command]
pub fn read_screenshots(path: String) -> Result<Value, Value> {
    genshin_utils::read_screenshots(path).into()
}
