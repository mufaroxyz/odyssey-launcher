use crate::lib::asset_manager::{AssetManagerState, Images};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
#[tauri::command]
pub fn fetch_images(state: tauri::State<AssetManagerState>) -> Result<Images, Error> {
    let state = state.0.lock().unwrap();
    let images = state.fetch_images();

    Ok(images)
}
