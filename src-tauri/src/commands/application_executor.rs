use std::{os::windows::process::CommandExt, string, sync::Arc};

use discord_rich_presence::activity::{Activity, Assets, Timestamps};
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
    use_fps_unlocker: bool,
) {
    let mut command = "cmd";
    let executable_path = format!("{}\\GenshinImpact.exe", &path);

    let args = vec!["/C", &executable_path];
    let mut arg = format!("/C {}", &executable_path);

    let formatted_exe: String;
    let new_path: String;
    if use_fps_unlocker {
        let current_exe = std::env::current_exe().unwrap();

        formatted_exe = format!(
            r"{}\odyssey-unlocker.exe",
            &current_exe.parent().unwrap().to_str().unwrap()
        );

        arg = format!("location={}", &executable_path);

        new_path = formatted_exe.clone();
        command = &new_path;
    }

    info!(
        "Starting Genshin Impact at: {} {} with args {}",
        command, &executable_path, &arg
    );

    let mut process = std::process::Command::new(command);
    if use_fps_unlocker {
        process.arg(&arg);
    } else {
        process.creation_flags(DETACHED_PROCESS);
        process.args(args);
    }

    info!(
        "Starting Genshin Impact, {:?}, {:?}",
        process.get_program(),
        process.get_args()
    );

    match process.spawn() {
        Ok(child) => {
            window.hide().unwrap();

            let asset = Assets::new()
                .large_image("logo")
                .large_text("Genshin Impact");

            let activity = Activity::new()
                .state("In Game")
                .details("Playing Genshin Impact")
                .timestamps(
                    Timestamps::new().start(
                        std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs() as i64,
                    ),
                )
                .assets(asset);

            let state_clone = Arc::clone(&state.0);

            let mut state_guard = state.0.lock().unwrap();
            let _ = state_guard.set_activity(activity);

            let start_time = std::time::Instant::now().clone();

            std::thread::spawn(move || {
                let output = child.wait_with_output().unwrap();
                info!("Output: {}", String::from_utf8_lossy(&output.stdout));
                info!("Errors: {}", String::from_utf8_lossy(&output.stderr));

                let elapsed = start_time.elapsed().as_secs();

                let activity = Activity::new().state("In Launcher").details("Home Screen");

                let mut state_guard = state_clone.lock().unwrap();
                let _ = state_guard.set_activity(activity);

                app_handle
                    .emit_all("play-time", PlayTime { elapsed: elapsed })
                    .unwrap();

                window.show().unwrap();
            });
        }
        Err(e) => {
            error!("Failed to start Genshin Impact: {:?}", e);
        }
    }
}
