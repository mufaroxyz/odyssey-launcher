use std::os::windows::process::CommandExt;

use discord_rich_presence::activity::{Activity, Assets};
use log::info;
use serde::Serialize;
use tauri::Manager;

use crate::lib::discord_rpc::DiscordRPCState;

const DETACHED_PROCESS: u32 = 0x00000008;

#[derive(Clone, Serialize)]
pub struct PlayTime {
    pub elapsed: u64,
}

#[tauri::command]
pub fn start_game(
    path: &str,
    window: tauri::Window,
    app_handle: tauri::AppHandle,
    state: tauri::State<DiscordRPCState>,
) {
    let mut state = state.0.lock().unwrap();

    let command = "cmd";
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    let args = vec!["/C", &executable_path];

    info!("Starting Genshin Impact at: {}", &executable_path);

    let mut process = std::process::Command::new(command);
    process.creation_flags(DETACHED_PROCESS);
    process.args(args);

    if let Ok(mut child) = process.spawn() {
        window.hide().unwrap();

        let asset = Assets::new()
            .large_image("logo")
            .large_text("Genshin Impact");

        let activity = Activity::new()
            .state("In Game")
            .details("Playing Genshin Impact")
            .assets(asset);

        let _ = state.set_activity(activity);

        let start_time = std::time::Instant::now();
        child.wait().unwrap();
        let elapsed = start_time.elapsed().as_secs();

        let activity = Activity::new().state("In Launcher").details("Home Screen");

        let _ = state.set_activity(activity);

        app_handle
            .emit_all("play-time", PlayTime { elapsed: elapsed })
            .unwrap();

        window.show().unwrap();
    } else {
        println!("Error: Failed to start Genshin Impact");
    }
}
