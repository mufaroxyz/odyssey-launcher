use crate::{installation::manager::install_game, lib::asset_manager::AssetManagerState};

#[tauri::command]
pub fn game_install(state: tauri::State<AssetManagerState>) {
    let state = state.0.lock().unwrap();

    let resources = state.fetch_game_resources();

    let _ = install_game(resources.data.game.latest);
}
