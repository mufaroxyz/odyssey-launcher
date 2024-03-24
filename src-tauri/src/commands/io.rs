use crate::lib::game_manifests;
use crate::lib::genshin_utils;

use serde_json::Value;

#[tauri::command]
pub fn find_installation_path() -> Result<Value, Value> {
    genshin_utils::auto_detect_genshin_installation()
}

#[tauri::command]
pub fn ensure_installation_path(path: String) -> Result<String, Value> {
    genshin_utils::ensure_installation_path(path).into()
}

#[tauri::command]
pub fn fetch_local_manifest(path: String) -> Result<Value, Value> {
    game_manifests::fetch_local_manifest(path).into()
}
