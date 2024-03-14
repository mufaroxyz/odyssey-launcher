use log::info;
use std::error::Error;

pub fn spawn_process(command: &str, args: Vec<&str>) -> Result<(), Box<dyn Error>> {
    info!("Spawning process: {} {:?}", command, args);
    let mut process = std::process::Command::new(command);
    process.args(args);
    process.spawn()?;
    Ok(())
}
