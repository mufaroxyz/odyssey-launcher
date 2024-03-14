use crate::lib;

#[tauri::command]
pub fn start_game(path: &str, window: tauri::Window) {
    let command = "cmd";
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    let args = vec!["/C", &executable_path];
    match lib::process_utils::spawn_process(command, args) {
        Ok(_) => {
            window.hide().unwrap();
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
}
