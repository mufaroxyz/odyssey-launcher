#[tauri::command]
pub fn hello_world() -> String {
    println!("Hello, World! Invoked from Rust");
    "Hello, World!".to_string()
}