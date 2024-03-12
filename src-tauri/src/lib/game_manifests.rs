use ini::ini;
use serde_json::Value;

pub fn fetch_local_manifest(path: String) -> Result<Value, Value> {
    let config_ini_path = format!("{}\\config.ini", &path);

    if !std::path::Path::new(&config_ini_path).exists() {
        return Err(serde_json::json!({
            "error": "Config file not found"
        }));
    }

    let config_map = ini!(&config_ini_path);

    if !config_map.contains_key("general") {
        return Err(serde_json::json!({
            "error": "General section not found in config file"
        }));
    }

    let mut general_map: std::collections::HashMap<_, _> = std::collections::HashMap::new();
    for (key, value) in config_map["general"].iter() {
        general_map.insert(key.to_string(), value);
    }

    let return_value = serde_json::json!({
        "path": path,
        "manifest": general_map,
    });

    Ok(return_value)
}
