use std::{
    error::Error,
    sync::{Arc, Mutex},
};

use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};

pub struct DiscordRPC<'a> {
    client_id: &'a str,
    client: Option<DiscordIpcClient>,
    ready: bool,
}

pub struct DiscordRPCState<'a>(pub Arc<Mutex<DiscordRPC<'a>>>);

impl<'a> Default for DiscordRPC<'a> {
    fn default() -> Self {
        DiscordRPC {
            client_id: "1217923016210776214",
            client: None,
            ready: false,
        }
    }
}

impl<'a> DiscordRPC<'a> {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn start(&mut self) -> Result<(), Box<dyn Error>> {
        let client_id = self.client_id;

        let mut client = DiscordIpcClient::new(client_id as &str)?;

        client.connect()?;

        self.ready = true;
        self.client = Some(client);

        Ok(())
    }

    pub fn set_activity(&mut self, activity: activity::Activity) -> Result<(), Box<dyn Error>> {
        if self.ready {
            let client = self.client.as_mut().unwrap();
            client.set_activity(activity)?;
            return Ok(());
        }

        Err("Discord RPC not ready".into())
    }
}
