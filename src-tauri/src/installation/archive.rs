use std::fs::File;
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use log::trace;
use serde::{Deserialize, Serialize};

use tar::Archive as TarArchive;
use zip::ZipArchive;
// use sevenz_rust::SevenZReader as SevenzArchive;

use bzip2::read::BzDecoder as Bz2Reader;
use flate2::read::GzDecoder as GzReader;
use xz::read::XzDecoder as XzReader;

const DETACHED_PROCESS: u32 = 0x00000008;

/// Get 7z binary if some is available
fn get7z() -> anyhow::Result<String> {
    let result = Command::new("7z")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(DETACHED_PROCESS)
        .output();

    if result.is_ok() {
        return Ok(String::from("7z"));
    }

    let result = Command::new("C:\\Program Files\\7-Zip\\7z.exe")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(DETACHED_PROCESS)
        .output();

    if result.is_ok() {
        return Ok(String::from("C:\\Program Files\\7-Zip\\7z.exe"));
    }

    Err(anyhow::anyhow!("7z binary not found"))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Size {
    Compressed(u64),
    Uncompressed(u64),
    Both { compressed: u64, uncompressed: u64 },
}

impl Size {
    pub fn get_size(&self) -> u64 {
        match self {
            Size::Compressed(size) => *size,
            Size::Uncompressed(size) => *size,
            Size::Both {
                compressed,
                uncompressed: _,
            } => *compressed,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entry {
    pub name: String,
    pub size: Size,
}

pub enum Archive {
    Zip(PathBuf, ZipArchive<File>),
    Tar(PathBuf, TarArchive<File>),
    TarXz(PathBuf, TarArchive<XzReader<File>>),
    TarGz(PathBuf, TarArchive<GzReader<File>>),
    TarBz2(PathBuf, TarArchive<Bz2Reader<File>>),
    SevenZ(PathBuf /*, SevenzArchive<File>*/),
    ZipMultipart(PathBuf),
}

impl Archive {
    pub fn open<T: Into<PathBuf>>(path: T) -> anyhow::Result<Self> {
        let path: PathBuf = path.into();
        let file = File::open(&path)?;

        info!("Opening archive: {}", path.to_string_lossy());

        let path_str = path.to_string_lossy();

        if &path_str[path_str.len() - 4..] == ".zip" {
            info!("Using zip format");
            Ok(Archive::Zip(path, ZipArchive::new(file)?))
        } else if &path_str[path_str.len() - 7..] == ".tar.xz" {
            info!("Using tar.xz format");
            Ok(Archive::TarXz(path, TarArchive::new(XzReader::new(file))))
        } else if &path_str[path_str.len() - 7..] == ".tar.gz" {
            info!("Using tar.gz format");
            Ok(Archive::TarGz(path, TarArchive::new(GzReader::new(file))))
        } else if &path_str[path_str.len() - 8..] == ".tar.bz2" {
            info!("Using tar.bz2 format");
            Ok(Archive::TarBz2(path, TarArchive::new(Bz2Reader::new(file))))
        } else if &path_str[path_str.len() - 3..] == ".7z" {
            info!("Using 7z format");
            Ok(Archive::SevenZ(
                path, /*, SevenzArchive::open(path, &[])?*/
            ))
        } else if &path_str[path_str.len() - 4..] == ".tar" {
            info!("Using tar format");
            Ok(Archive::Tar(path, TarArchive::new(file)))
        } else if &path_str[path_str.len() - 8..] == ".zip.001"
            || &path_str[path_str.len() - 7..] == ".7z.001"
            || &path_str[path_str.len() - 4..] == ".z01"
        {
            info!("Using multipart zip format");
            Ok(Archive::ZipMultipart(path))
        } else {
            Err(anyhow::anyhow!(
                "Archive format is not supported: {}",
                path.to_string_lossy()
            ))
        }
    }

    /// Tar archives may forbid you to extract them if you call this method
    pub fn get_entries(&mut self) -> anyhow::Result<Vec<Entry>> {
        let mut entries = Vec::new();

        match self {
            Archive::Zip(_, zip) => {
                for i in 0..zip.len() {
                    let entry = zip.by_index(i)?;

                    entries.push(Entry {
                        name: entry.name().to_string(),
                        size: Size::Both {
                            compressed: entry.compressed_size(),
                            uncompressed: entry.size(),
                        },
                    });
                }
            }

            Archive::Tar(_, tar) => {
                for entry in tar.entries()?.flatten() {
                    entries.push(Entry {
                        name: entry.path()?.to_str().unwrap().to_string(),
                        size: Size::Compressed(entry.size()),
                    });
                }
            }

            Archive::TarXz(_, tar) => {
                for entry in tar.entries()?.flatten() {
                    entries.push(Entry {
                        name: entry.path()?.to_str().unwrap().to_string(),
                        size: Size::Compressed(entry.size()),
                    });
                }
            }

            Archive::TarGz(_, tar) => {
                for entry in tar.entries()?.flatten() {
                    entries.push(Entry {
                        name: entry.path()?.to_str().unwrap().to_string(),
                        size: Size::Compressed(entry.size()),
                    });
                }
            }

            Archive::TarBz2(_, tar) => {
                for entry in tar.entries()?.flatten() {
                    entries.push(Entry {
                        name: entry.path()?.to_str().unwrap().to_string(),
                        size: Size::Compressed(entry.size()),
                    });
                }
            }

            #[allow(unused_must_use)]
            Archive::SevenZ(path) | Archive::ZipMultipart(path) => {
                info!("Getting entries for 7z archive");
                /*let (send, recv) = std::sync::mpsc::channel();

                sz.for_each_entries(move |entry, _| {
                    send.send(Entry {
                        name: entry.name.clone(),
                        size: Size::Both {
                            compressed: entry.compressed_size,
                            uncompressed: entry.size
                        }
                    });

                    Ok(true)
                });

                while let Ok(entry) = recv.recv() {
                    entries.push(entry);
                }*/

                let output = Command::new(get7z()?)
                    .arg("l")
                    .arg(&path)
                    .stdout(Stdio::piped())
                    .stderr(Stdio::null())
                    .creation_flags(DETACHED_PROCESS)
                    .output()?;

                info!("7z output: {}", String::from_utf8_lossy(&output.stdout));

                let output = String::from_utf8(output.stdout)?;

                let output = output.split("-------------------").collect::<Vec<&str>>();
                let mut output = output[1..output.len() - 1].join("-------------------");

                // In some cases 7z can report two ending sequences instead of one:
                //
                // ```
                // ------------------- ----- ------------ ------------  ------------------------
                // 2023-09-15 10:20:44        66677218871  65387995385  13810 files, 81 folders
                //
                // ------------------- ----- ------------ ------------  ------------------------
                // 2023-09-15 10:20:44        66677218871  65387995385  13810 files, 81 folders
                // ```
                //
                // This should filter this case
                if let Some((files_list, _)) = output.split_once("\n-------------------") {
                    output = files_list.to_string();
                }

                info!("Trying to parse 7z output");
                for line in output.split('\n').collect::<Vec<&str>>() {
                    if !line.starts_with('-') && !line.starts_with(" -") {
                        let words = line
                            .split("  ")
                            .filter_map(|word| {
                                let word = word.trim();

                                if word.is_empty() {
                                    None
                                } else {
                                    Some(word)
                                }
                            })
                            .collect::<Vec<&str>>();

                        entries.push(Entry {
                            name: words[words.len() - 1].to_string(),
                            size: Size::Uncompressed(words[1].parse::<u64>()?),
                        });
                    }
                }
            }
        }

        Ok(entries)
    }

    pub fn extract<T: Into<PathBuf> + std::fmt::Debug>(&mut self, folder: T) -> anyhow::Result<()> {
        trace!("Extracting archive");

        let folder = folder.into();

        match self {
            Archive::Zip(archive, zip) => {
                info!("Extracting zip archive");

                if zip.extract(&folder).is_err() {
                    Command::new("unzip")
                        .arg("-q")
                        .arg("-o")
                        .arg(archive)
                        .arg("-d")
                        .arg(folder)
                        .output()?;
                }
            }

            Archive::Tar(_, tar) => {
                tar.unpack(folder)?;
            }

            Archive::TarXz(_, tar) => {
                tar.unpack(folder)?;
            }

            Archive::TarGz(_, tar) => {
                tar.unpack(folder)?;
            }

            Archive::TarBz2(_, tar) => {
                tar.unpack(folder)?;
            }

            Archive::SevenZ(archive) | Archive::ZipMultipart(archive) => {
                // sevenz_rust::decompress_file(archive, folder.into())?;
                info!("Extracting 7z archive");
                // Extract the archive
                Command::new(get7z()?)
                    .arg("x")
                    .arg(archive)
                    .arg(format!("-o{}", folder.to_string_lossy()))
                    .arg("-aoa")
                    .creation_flags(DETACHED_PROCESS)
                    .output()?;
            }
        }

        Ok(())
    }
}
