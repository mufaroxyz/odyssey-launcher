use std::path::PathBuf;

use serde::Serialize;
use serde_json::Value;
use tauri::Manager;

use crate::{
    installation::manager::install_game, lib::asset_manager::AssetManagerState,
    IsGameInstallingState,
};

#[derive(Clone, Serialize)]
struct NextStepPayload {
    step: i32,
}

#[tauri::command]
pub fn game_install(
    app_handle: tauri::AppHandle,
    state: tauri::State<AssetManagerState>,
    is_game_installing_state: tauri::State<'_, IsGameInstallingState>,
    installation_path: &str,
    temp_path: Option<&str>,
) -> Result<(), Value> {
    info!("Recieved game_install command");

    info!(
        "is_game_installing_state: {:?}",
        is_game_installing_state.0.lock().unwrap().is_installing
    );

    if (*is_game_installing_state.0.lock().unwrap()).is_installing {
        app_handle
            .emit_all(
                "installation-running-step",
                NextStepPayload {
                    step: (*is_game_installing_state.0.lock().unwrap()).step,
                },
            )
            .unwrap();

        return Err(serde_json::json!({
            "error": "Game is already installing",
            // "step": (*is_game_installing_state.0.lock().unwrap()).step
        }));
    }

    (*is_game_installing_state.0.lock().unwrap()).is_installing = true;

    let state = state.0.lock().unwrap();

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 1 })
        .unwrap();

    let resources = state.fetch_game_resources();

    let installation_path = PathBuf::from(installation_path);
    let temp_path = temp_path
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::temp_dir().to_path_buf());

    if !installation_path.exists() {
        std::fs::create_dir_all(&installation_path).unwrap();
    }

    if !temp_path.exists() {
        std::fs::create_dir_all(&temp_path).unwrap();
    }

    let _ = install_game(
        resources.data.game.latest,
        installation_path,
        temp_path,
        app_handle,
    );

    Ok(())
}
