#[tauri::command]
pub fn send_notification(title: String, body: String, app_handle: tauri::AppHandle) {
    let _ =
        tauri::api::notification::Notification::new(&app_handle.config().tauri.bundle.identifier)
            .title(title)
            .body(body)
            .show();
}
