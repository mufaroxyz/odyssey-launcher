use serde_json::Value;

#[tauri::command]
pub fn scrape_banner() -> Result<Value, Value> {
    crate::lib::asset_scraper::scrape_banner().into()
}
