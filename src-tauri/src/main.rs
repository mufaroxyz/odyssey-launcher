// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use crate::lib::discord_rpc::{DiscordRPC, DiscordRPCState};
use discord_rich_presence::activity::{Activity, Assets};
use lib::asset_manager::{AssetManager, AssetManagerState};
use simple_logger::SimpleLogger;
use tauri::{CustomMenuItem, Manager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

pub mod commands;
pub mod game;
pub mod installation;
pub mod lib;

fn main() {
    SimpleLogger::new().init().unwrap();

    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(tauri::Icon::Raw(
            include_bytes!("../icons/icon.ico").to_vec(),
        ));

    let discord_rpc = DiscordRPC::new();
    let asset_manager = AssetManager::new();

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let main_window = app.get_window("main").expect("main window");

                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show_window" => main_window.show().unwrap(),
                    _ => {}
                }
            }
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
        .manage(AssetManagerState(Arc::new(Mutex::new(asset_manager))))
        .invoke_handler(tauri::generate_handler![
            commands::hello_world::hello_world,
            commands::utils::send_notification,
            commands::io::find_installation_path,
            commands::io::ensure_installation_path,
            commands::io::fetch_local_manifest,
            commands::io::get_executable_path,
            commands::application_executor::start_game,
            commands::assets::fetch_images,
            commands::installation::game_install,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| match event {
            RunEvent::Ready { .. } => {
                let state = &app_handle.state::<DiscordRPCState>();
                let mut state = state.0.lock().unwrap();

                let _ = state.start();

                let assets = Assets::new().large_image("logo");

                let activity = Activity::new()
                    .state("In launcher")
                    .details("Home screen")
                    .assets(assets);

                let _ = state.set_activity(activity);
            }

            _ => {}
        });
}
