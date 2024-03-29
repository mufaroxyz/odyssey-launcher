use crate::installation::archive::Archive;
use crate::installation::downloader::DownloadingError;
use crate::{
    installation::{downloader::Downloader, free_space},
    lib::asset_manager::GameLatest,
};
use crate::{GameInstallingState, IsGameInstallingState};
use log::{error, info, trace};
use serde::{Deserialize, Serialize};
use std::cell::Cell;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
/**
 * The installation process is implemented by An Anime Team, i just skidded it and modified a little for Windows
 *
 * >>> https://github.com/an-anime-team/anime-game-core
 */
use std::time::{Duration, Instant};
use tauri::Manager;

use std::sync::Arc;
use thiserror::Error;

#[derive(Clone, Serialize)]
struct EmptyPayload {}

#[derive(Clone, Serialize)]
struct NextStepPayload {
    step: i32,
}

#[derive(Clone, Serialize)]
struct ProgresPayload {
    percentage: f64,
    downloaded: u64,
    total: u64,
}

#[derive(Clone, Serialize)]
struct UnpackingPayload {
    percentage: f64,
    unpacked: u64,
    total: u64,
}

#[derive(Error, Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiffDownloadingError {
    /// Your installation is already up to date and not needed to be updated
    #[error("Component version is already latest")]
    AlreadyLatest,

    /// Current version is too outdated and can't be updated.
    /// It means that you have to download everything from zero
    #[error("Components version is too outdated and can't be updated")]
    Outdated,

    /// When there's multiple urls and you can't save them as a single file
    #[error("Component has multiple downloading urls and can't be saved as a single file")]
    MultipleSegments,

    /// Failed to fetch remove data. Redirected from `Downloader`
    #[error("{0}")]
    DownloadingError(#[from] DownloadingError),

    /// Failed to apply hdiff patch
    #[error("Failed to apply hdiff patch: {0}")]
    HdiffPatch(String),

    /// Installation path wasn't specified. This could happen when you
    /// try to call `install` method on `VersionDiff` that was generated
    /// in `VoicePackage::list_latest`. This method couldn't know
    /// your game installation path and thus indicates that it doesn't know
    /// where this package needs to be installed
    #[error("Path to the component's downloading folder is not specified")]
    PathNotSpecified,

    #[error("Canceled by user")]
    Canceled,
}

impl From<minreq::Error> for DiffDownloadingError {
    fn from(error: minreq::Error) -> Self {
        DownloadingError::Minreq(error.to_string()).into()
    }
}

pub fn install_game(
    diffs: GameLatest,
    installation_path: PathBuf,
    temp_path: PathBuf,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    std::thread::spawn(move || {
        let result = install(
            diffs,
            installation_path.clone(),
            temp_path.clone(),
            app_handle.clone(),
        );

        if let Err(err) = result {
            error!("Failed to install game: {:?}", err);
        }
    });

    Ok(())
}

fn install(
    diffs: GameLatest,
    installation_path: PathBuf,
    temp_path: PathBuf,
    app_handle: tauri::AppHandle,
) -> Result<(), DiffDownloadingError> {
    info!("Getting package segments");

    println!("Installation Path: {:?}", &installation_path);
    println!("Temp Path: {:?}", &temp_path);

    let game_installing_state = &app_handle.state::<IsGameInstallingState>();
    let mut game_installing_state = *game_installing_state.0.lock().unwrap();

    game_installing_state.step = 2;

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 2 })
        .unwrap();

    let segment_urls = diffs
        .segments
        .iter()
        .map(|segment| segment.path.clone())
        .collect::<Vec<String>>();

    let downloaded_size = diffs.package_size.parse::<u64>().unwrap();
    let unpacked_size = diffs.size.parse::<u64>().unwrap();

    // Delete everything from installation_path except .version file if the size is smaller than the downloaded size - 1GB

    let size_of_installed = free_space::size_of_folder(&installation_path);

    if size_of_installed < downloaded_size - 1_000_000_000 {
        info!("Deleting everything from installation folder");

        #[allow(unused_must_use)]
        {
            for entry in std::fs::read_dir(&installation_path).unwrap() {
                let entry = entry.unwrap();
                let path = entry.path();

                if path.is_file() {
                    std::fs::remove_file(&path);
                } else {
                    std::fs::remove_dir_all(&path);
                }
            }
        }
    }

    info!("Checking free temp space");

    let Some(space) = free_space::available(&temp_path) else {
        error!("Path is not mounted, :{:?}", &temp_path);
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::PathNotMounted(temp_path.into()),
        ));
    };

    let required = if free_space::is_same_disk(&temp_path, &installation_path) {
        downloaded_size + unpacked_size
    } else {
        downloaded_size
    };

    if space < required {
        error!("Not enough free space available in the temp folder. Required: {required}. Available: {space}");
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::NoSpaceAvailable(temp_path, required, space),
        ));
    }

    info!("Checking free installation space");

    let Some(space) = free_space::available(&installation_path) else {
        error!("Path is not mounted, :{:?}", &installation_path);
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::PathNotMounted(installation_path.into()),
        ));
    };

    let required: u64 = if free_space::is_same_disk(&installation_path, &temp_path) {
        downloaded_size + unpacked_size
    } else {
        downloaded_size
    };

    if space < required {
        error!("Not enough free space available in the installation folder. Required: {unpacked_size}. Available: {space}");
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::NoSpaceAvailable(installation_path, required, space),
        ));
    }

    let mut current_downloaded = 0;
    let mut segments_names: Vec<String> = Vec::new();

    info!("Starting installer: downloading segments");

    game_installing_state.step = 3;

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 3 })
        .unwrap();

    for url in segment_urls {
        let mut downloader = Downloader::new(url)?.with_free_space_check(false);

        let local_total = downloader.length().unwrap();
        let segment_name = downloader.get_filename().to_string();

        let app_handle_clone: Arc<tauri::AppHandle> = Arc::new(app_handle.clone());

        let last_emit = Cell::new(Instant::now());

        downloader.download(temp_path.join(&segment_name), move |current, _| {
            let curr_downloaded = current_downloaded + current;

            let percentage = (curr_downloaded as f64 / downloaded_size as f64) * 100.0;

            if last_emit.get().elapsed() >= Duration::from_secs(1) {
                app_handle_clone
                    .emit_all(
                        "installation-progress",
                        ProgresPayload {
                            percentage,
                            downloaded: curr_downloaded,
                            total: downloaded_size,
                        },
                    )
                    .unwrap();

                last_emit.set(Instant::now());
            }

            Ok(())
        })?;

        segments_names.push(segment_name);

        current_downloaded += local_total;
    }

    info!("All segments downloaded");

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 4 })
        .unwrap();

    let first_segment_name = segments_names[0].clone();

    let last_emit = Cell::new(Instant::now());

    match Archive::open(temp_path.join(&first_segment_name)) {
        Ok(mut archive) => {
            let mut total = 0;

            let entries = archive.get_entries().expect("Failed to get entries");

            for entry in &entries {
                total += entry.size.get_size();

                // let path = installation_path.join(&entry.name);
            }

            info!("Extracting archive");

            let unpacking_path = installation_path.clone();

            let app_handle_clone: Arc<tauri::AppHandle> = Arc::new(app_handle.clone());

            let handle_2 = std::thread::spawn(move || {
                let mut entries = entries
                    .into_iter()
                    .map(|entry| {
                        (
                            unpacking_path.join(&entry.name),
                            entry.size.get_size(),
                            true,
                        )
                    })
                    .collect::<Vec<_>>();

                let mut unpacked = 0;

                loop {
                    std::thread::sleep(std::time::Duration::from_millis(250));

                    if last_emit.get().elapsed() >= Duration::from_secs(1) {
                        let percentage = (unpacked as f64 / total as f64) * 100.0;

                        app_handle_clone
                            .emit_all(
                                "installation-unpacking",
                                UnpackingPayload {
                                    percentage,
                                    unpacked,
                                    total,
                                },
                            )
                            .unwrap();

                        last_emit.set(Instant::now());
                    }

                    let mut empty = true;

                    for (path, size, remained) in &mut entries {
                        if *remained {
                            empty = false;

                            if std::path::Path::new(path).exists() {
                                *remained = false;

                                unpacked += *size;
                            }
                        }
                    }

                    let percentage = (unpacked as f64 / total as f64) * 100.0;

                    app_handle_clone
                        .emit_all(
                            "installation-unpacking",
                            UnpackingPayload {
                                percentage,
                                unpacked,
                                total,
                            },
                        )
                        .unwrap();

                    // info!("Unpacking: {}/{}", unpacked, total);

                    if empty {
                        break;
                    }
                }
            });

            let extract_to = installation_path.clone();

            let handle_1 = std::thread::spawn(move || {
                info!(
                    "Unpacking Started, Extracting archive to {:?}",
                    extract_to.clone()
                );

                match Archive::open(temp_path.join(first_segment_name)) {
                    Ok(mut archive) => match archive.extract(&extract_to) {
                        Ok(_) => {
                            #[allow(unused_must_use)]
                            {
                                for name in segments_names {
                                    std::fs::remove_file(temp_path.join(name));
                                }
                            }

                            info!("Unpacking finished");
                        }

                        Err(err) => {
                            error!("Failed to extract archive: {:?}", err);
                        }
                    },

                    Err(err) => {
                        error!("Failed to open archive: {:?}", err);
                    }
                }
            });

            handle_1.join().unwrap();
            handle_2.join().unwrap();
        }

        Err(err) => {
            error!("Failed to open archive: {:?}", err);
            return Err(DiffDownloadingError::DownloadingError(
                DownloadingError::OutputFileError(
                    temp_path.join(first_segment_name),
                    err.to_string(),
                ),
            ));
        }
    }

    game_installing_state.step = 5;

    app_handle
        .emit_all("installation-next-step", NextStepPayload { step: 5 })
        .unwrap();

    #[allow(unused_must_use)]
    {
        let version_path = installation_path.join(".version");

        std::fs::write(version_path, diffs.version);
    }

    app_handle
        .emit_all("installation-finish", EmptyPayload {})
        .unwrap();

    Ok(())
}
