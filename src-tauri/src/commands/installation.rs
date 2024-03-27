use std::path::PathBuf;

use crate::{installation::manager::install_game, lib::asset_manager::AssetManagerState};

#[tauri::command]
pub fn game_install(
    state: tauri::State<AssetManagerState>,
    installation_path: &str,
    temp_path: Option<&str>,
) {
    let state = state.0.lock().unwrap();

    let resources = state.fetch_game_resources();

    let installation_path = PathBuf::from(installation_path);
    let temp_path = temp_path
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::temp_dir().to_path_buf());

    let _ = install_game(resources.data.game.latest, installation_path, temp_path);
}
