// That's just a playground for testing shrug

use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
pub fn hello_world(app_handle: tauri::AppHandle) -> String {
    app_handle
        .emit_all(
            "installation-next-step",
            Payload {
                message: "null".into(),
            },
        )
        .unwrap();
    app_handle
        .emit_all(
            "installation-next-step",
            Payload {
                message: "null".into(),
            },
        )
        .unwrap();
    app_handle
        .emit_all(
            "installation-next-step",
            Payload {
                message: "null".into(),
            },
        )
        .unwrap();
    app_handle
        .emit_all(
            "installation-next-step",
            Payload {
                message: "null".into(),
            },
        )
        .unwrap();
    println!("Hello, World! Invoked from Rust");
    "Hello, World!".to_string()
}
