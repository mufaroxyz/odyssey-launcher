use std::io::Read;
use std::{fs::File, path::PathBuf};

use super::version::Version;

pub fn get_version(path: &str) -> anyhow::Result<Version> {
    log::debug!("Trying to get installed game version");

    let path = PathBuf::from(path);

    fn bytes_to_num(bytes: &Vec<u8>) -> u8 {
        bytes.iter().fold(0u8, |acc, &x| acc * 10 + (x - b'0'))
    }

    let file = File::open(path.join("GenshinImpact_Data").join("globalgamemanagers"))?;

    // [0..9]
    let allowed = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

    let mut version: [Vec<u8>; 3] = [vec![], vec![], vec![]];
    let mut version_ptr: usize = 0;
    let mut correct = true;

    for byte in file.bytes().skip(4000).take(10000).flatten() {
        match byte {
            0 => {
                version = [vec![], vec![], vec![]];
                version_ptr = 0;
                correct = true;
            }

            46 => {
                version_ptr += 1;

                if version_ptr > 2 {
                    correct = false;
                }
            }

            95 => {
                if correct
                    && !version[0].is_empty()
                    && !version[1].is_empty()
                    && !version[2].is_empty()
                {
                    return Ok(Version::new(
                        bytes_to_num(&version[0]),
                        bytes_to_num(&version[1]),
                        bytes_to_num(&version[2]),
                    ));
                }

                correct = false;
            }

            _ => {
                if correct && allowed.contains(&byte) {
                    version[version_ptr].push(byte);
                } else {
                    correct = false;
                }
            }
        }
    }

    log::error!("Version's bytes sequence wasn't found");

    anyhow::bail!("Version's bytes sequence wasn't found");
}
