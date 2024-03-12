use serde_json::Value;

pub fn try_get_genshin_installation_path() -> Result<Value, Value> {
    let path = "C:\\Program Files\\Genshin Impact\\Genshin Impact Game";
    if std::path::Path::new(&path).exists() {
        // Ok("C:\\Program Files\\Genshin Impact\\Genshin Impact Game".to_string())
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

pub fn ensure_installation_path(path: String) -> Result<String, Value> {
    println!("ensure_installation_path: {}", &path);
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    if std::path::Path::new(&executable_path).exists() {
        let return_value = serde_json::json!({
            "path": &path,
        });
        Ok(return_value.to_string())
    } else {
        let return_value = serde_json::json!({
          "error": "Genshin Impact installation not found"
        });
        Err(return_value)
    }
}
