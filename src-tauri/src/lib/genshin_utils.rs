use log::info;
use serde_json::Value;
use winreg::enums::HKEY_LOCAL_MACHINE;

pub fn auto_detect_genshin_installation() -> Result<Value, Value> {
    let uninstaller_key = winreg::RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(key) = uninstaller_key.open_subkey_with_flags(
        "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Genshin Impact",
        winreg::enums::KEY_READ,
    ) {
        info!("Found Genshin Impact uninstaller key");

        // let install_location: String = key.get_value("InstallPath")

        if let Ok(install_location) = key.get_value::<String, _>("InstallLocation") {
            info!("Auto-detected Genshin Impact installation at: {install_location}");

            let return_value = serde_json::json!({
                "path": format!("{}\\Genshin Impact game", install_location)
            });

            Ok(return_value)
        } else {
            let return_value = serde_json::json!({
                "error": "Genshin Impact not found in registry"
            });
            return Err(return_value);
        }
    } else {
        let return_value = serde_json::json!({
            "error": "Genshin Impact not found in registry"
        });
        return Err(return_value);
    }
}

pub fn ensure_installation_path(path: String) -> Result<Value, Value> {
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    info!(
        "Checking if Genshin Impact is installed at: {}",
        &executable_path
    );
    if std::path::Path::new(&executable_path).exists() {
        let return_value = serde_json::json!({
            "path": &path,
        });
        Ok(return_value)
    } else {
        let return_value = serde_json::json!({
          "error": "Genshin Impact installation not found"
        });
        Err(return_value)
    }
}

pub fn read_screenshots(path: String) -> Result<Value, Value> {
    let screenshots_path = format!("{}\\ScreenShot", &path);
    info!("Reading screenshots from: {}", &screenshots_path);
    let screenshots = std::fs::read_dir(&screenshots_path);
    match screenshots {
        Ok(screenshots) => {
            let mut screenshot_list = Vec::new();
            for screenshot in screenshots {
                let screenshot = screenshot.unwrap();
                let screenshot_path = screenshot.path();
                let screenshot_path = screenshot_path.to_string_lossy().into_owned();
                screenshot_list.push(screenshot_path);
            }
            let return_value = serde_json::json!(screenshot_list);
            Ok(return_value)
        }
        Err(_) => {
            let return_value = serde_json::json!({
                "error": "Failed to read screenshots"
            });
            Err(return_value)
        }
    }
}
