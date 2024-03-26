/**
 * The installation process is implemented by An Anime Team, i just skidded it and modified a little for Windows
 *
 * >>> https://github.com/an-anime-team/anime-game-core
 */
use crate::installation::archive::Archive;
use crate::installation::downloader::DownloadingError;
use crate::{
    installation::{downloader::Downloader, free_space},
    lib::asset_manager::GameLatest,
};
use log::{error, info, trace};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use thiserror::Error;

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
}

impl From<minreq::Error> for DiffDownloadingError {
    fn from(error: minreq::Error) -> Self {
        DownloadingError::Minreq(error.to_string()).into()
    }
}

pub fn install_game(diffs: GameLatest) -> Result<(), ()> {
    info!("Spawning installation thread");
    std::thread::spawn(move || {
        let _ = install_thread(diffs);
    });

    Ok(())
}

fn install_thread(diffs: GameLatest) -> Result<(), DiffDownloadingError> {
    info!("Getting package segments");

    // TODO: Change this to the actual installation path instead of fixed path for testing

    let INSTALLATION_PATH: PathBuf = Path::new("M://genshin_loader/").to_path_buf();
    // let TEMP_PATH: PathBuf = std::env::temp_dir().to_path_buf();
    let TEMP_PATH = Path::new("M://temp/").to_path_buf();

    println!("INSTALLATION_PATH: {:?}", INSTALLATION_PATH);
    println!("TEMP_PATH: {:?}", TEMP_PATH);

    let segment_urls = diffs
        .segments
        .iter()
        .map(|segment| segment.path.clone())
        .collect::<Vec<String>>();

    let downloaded_size = diffs.package_size.parse::<u64>().unwrap();
    let unpacked_size = diffs.size.parse::<u64>().unwrap();

    info!("Checking free temp space");

    let Some(space) = free_space::available(&TEMP_PATH) else {
        error!("Path is not mounted, :{:?}", &TEMP_PATH);
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::PathNotMounted(TEMP_PATH.into()),
        ));
    };

    let required = if free_space::is_same_disk(&TEMP_PATH, &INSTALLATION_PATH) {
        downloaded_size + unpacked_size
    } else {
        downloaded_size
    };

    if space < required {
        error!("Not enough free space available in the temp folder. Required: {required}. Available: {space}");
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::NoSpaceAvailable(TEMP_PATH, required, space),
        ));
    }

    info!("Checking free installation space");

    let Some(space) = free_space::available(&INSTALLATION_PATH) else {
        error!("Path is not mounted, :{:?}", &INSTALLATION_PATH);
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::PathNotMounted(INSTALLATION_PATH.into()),
        ));
    };

    let required: u64 = if free_space::is_same_disk(&INSTALLATION_PATH, &TEMP_PATH) {
        downloaded_size + unpacked_size
    } else {
        downloaded_size
    };

    if space < required {
        error!("Not enough free space available in the installation folder. Required: {unpacked_size}. Available: {space}");
        return Err(DiffDownloadingError::DownloadingError(
            DownloadingError::NoSpaceAvailable(INSTALLATION_PATH, required, space),
        ));
    }

    let mut current_downloaded = 0;
    let mut segments_names: Vec<String> = Vec::new();

    info!("Starting installer: downloading segments");

    for url in segment_urls {
        let mut downloader = Downloader::new(url)?.with_free_space_check(false);

        println!("test");

        let local_total = downloader.length().unwrap();
        let segment_name = downloader.get_filename().to_string();

        println!("test");

        downloader.download(TEMP_PATH.join(&segment_name), move |current, _| {
            let curr_downloaded = current_downloaded + current;
            info!(
                "Downloading segment: {}/{}",
                &curr_downloaded, &downloaded_size
            );
        })?;

        segments_names.push(segment_name);

        current_downloaded += local_total;
    }

    info!("All segments downloaded");

    let first_segment_name = segments_names[0].clone();

    match Archive::open(TEMP_PATH.join(&first_segment_name)) {
        Ok(mut archive) => {
            let mut total = 0;

            let entries = archive.get_entries().expect("Failed to get entries");

            for entry in &entries {
                total += entry.size.get_size();

                // let path = INSTALLATION_PATH.join(&entry.name);
            }

            trace!("Extracting archive");

            let unpacking_path = INSTALLATION_PATH.clone();

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

                    info!("Unpacking: {}/{}", unpacked, total);

                    if empty {
                        break;
                    }
                }
            });

            let extract_to = INSTALLATION_PATH.clone();

            let handle_1 = std::thread::spawn(move || {
                info!(
                    "Unpacking Started, Extracting archive to {:?}",
                    extract_to.clone()
                );

                match Archive::open(TEMP_PATH.join(first_segment_name)) {
                    Ok(mut archive) => match archive.extract(&extract_to) {
                        Ok(_) => {
                            #[allow(unused_must_use)]
                            {
                                for name in segments_names {
                                    std::fs::remove_file(TEMP_PATH.join(name));
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
        }
    }

    Ok(())
}
