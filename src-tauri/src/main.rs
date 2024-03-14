// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use crate::lib::discord_rpc::{DiscordRPC, DiscordRPCState};
use discord_rich_presence::activity::{Activity, Assets};
use tauri::{
    CustomMenuItem, Manager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

pub mod commands;
pub mod lib;

fn main() {
    let start_game = CustomMenuItem::new("start_game".to_string(), "Start Game");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(start_game)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(tauri::Icon::Raw(
            include_bytes!("../icons/icon.ico").to_vec(),
        ));

    let discord_rpc = DiscordRPC::new();

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            SystemTrayEvent::LeftClick { .. } => {
                let window = match app.get_window("main") {
                    Some(window) => match window.is_visible().expect("winvis") {
                        true => return,
                        false => window,
                    },
                    None => return,
                };
                #[cfg(not(target_os = "macos"))]
                {
                    window.show().unwrap()
                }
                window.set_focus().unwrap();
            }
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(DiscordRPCState(Arc::new(Mutex::new(discord_rpc))))
        .invoke_handler(tauri::generate_handler![
            commands::hello_world::hello_world,
            commands::io::find_installation_path,
            commands::io::ensure_installation_path,
            commands::io::fetch_local_manifest,
            commands::assets::scrape_banner,
            commands::application_executor::start_game
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| match event {
            RunEvent::Ready { .. } => {
                let mut state = &app_handle.state::<DiscordRPCState>();
                let mut state = state.0.lock().unwrap();

                state.start();

                let assets = Assets::new().large_image("logo");

                let activity = Activity::new()
                    .state("In launcher")
                    .details("Idle")
                    .assets(assets);

                state.set_activity(activity);
            }
            RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
