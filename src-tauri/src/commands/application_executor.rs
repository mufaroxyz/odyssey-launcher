use log::info;

use crate::lib;

#[tauri::command]
pub fn start_game(path: &str, window: tauri::Window) {
    let command = "cmd";
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    let args = vec!["/C", &executable_path];

    info!("Starting Genshin Impact at: {}", &executable_path);

    let mut process = std::process::Command::new(command);
    process.args(args);

    if let Ok(mut child) = process.spawn() {
        window.hide().unwrap();
        child.wait().unwrap();

        window.show().unwrap();
    } else {
        println!("Error: Failed to start Genshin Impact");
    }

    // Wait for the process to finish
}
