use std::os::windows::process::CommandExt;

use log::info;

const DETACHED_PROCESS: u32 = 0x00000008;

#[tauri::command]
pub fn start_game(path: &str, window: tauri::Window) {
    let command = "cmd";
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    let args = vec!["/C", &executable_path];

    info!("Starting Genshin Impact at: {}", &executable_path);

    let mut process = std::process::Command::new(command);
    process.creation_flags(DETACHED_PROCESS);
    process.args(args);

    if let Ok(mut child) = process.spawn() {
        window.hide().unwrap();
        child.wait().unwrap();

        window.show().unwrap();
    } else {
        println!("Error: Failed to start Genshin Impact");
    }
}
