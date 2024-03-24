use log::info;
use std::{error::Error, process::Command};

pub fn spawn_process(command: &str, args: Vec<&str>) -> Result<Command, Box<dyn Error>> {
    info!("Spawning process: {} {:?}", command, args);
    let mut process = std::process::Command::new(command);
    process.args(args);
    process.spawn()?;
    Ok(process)
}
