use std::path::PathBuf;

use serde::Serialize;
use tauri::Manager;

use crate::{installation::manager::install_game, lib::asset_manager::AssetManagerState};

#[derive(Clone, Serialize)]
struct NextStepPayload {
    step: i32,
}

#[tauri::command]
pub fn game_install(
    app_handle: tauri::AppHandle,
    state: tauri::State<AssetManagerState>,
    installation_path: &str,
    temp_path: Option<&str>,
) {
    let state = state.0.lock().unwrap();

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 1 })
        .unwrap();

    let resources = state.fetch_game_resources();

    let installation_path = PathBuf::from(installation_path);
    let temp_path = temp_path
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::temp_dir().to_path_buf());

    let _ = install_game(
        resources.data.game.latest,
        installation_path,
        temp_path,
        app_handle,
    );
}
