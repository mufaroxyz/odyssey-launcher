// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    os::windows::process::CommandExt,
    process::Command,
    sync::{Arc, Mutex},
};

const DETACHED_PROCESS: u32 = 0x00000008;

use crate::lib::discord_rpc::{DiscordRPC, DiscordRPCState};
use discord_rich_presence::activity::{Activity, Assets};
use lib::asset_manager::{AssetManager, AssetManagerState};
use tauri::{CustomMenuItem, Manager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

#[macro_use]
extern crate log;
extern crate simplelog;

use simplelog::*;

pub mod commands;
pub mod game;
pub mod installation;
pub mod lib;
pub mod traits;

#[derive(Clone, Copy)]
pub struct GameInstallingState {
    pub is_installing: bool,
    pub step: i32,
}

pub struct IsGameInstallingState(Arc<Mutex<GameInstallingState>>);

fn main() {
    CombinedLogger::init(vec![
        TermLogger::new(
            LevelFilter::Info,
            Config::default(),
            TerminalMode::Mixed,
            ColorChoice::Auto,
        ),
        WriteLogger::new(
            LevelFilter::Info,
            Config::default(),
            std::fs::File::create("odyssey-launcher.log").unwrap(),
        ),
    ])
    .unwrap();

    let is_7z_installed_winget = Command::new("winget")
        .args(&["list", "-q", "7zip.7zip"])
        .creation_flags(DETACHED_PROCESS)
        .output();

    if is_7z_installed_winget.is_err() || !is_7z_installed_winget.unwrap().status.success() {
        let _ = msgbox::create(
            "Odyssey Launcher",
            "7-Zip is not installed, installing now.",
            msgbox::IconType::None,
        );

        let install_7z = Command::new("winget")
            .args(&["install", "-e", "--id", "7zip.7zip", "--silent"])
            .creation_flags(DETACHED_PROCESS)
            .output();

        if install_7z.is_err() {
            let _ = msgbox::create(
                "Odyssey Launcher",
                "7-Zip is not installed, please install it before running Odyssey Launcher",
                msgbox::IconType::Error,
            );
            log::error!(
                "7-Zip is not installed, please install it before running Odyssey Launcher"
            );
            std::process::exit(1);
        }
    }

    info!("Starting Odyssey Launcher");

    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(tauri::Icon::Raw(
            include_bytes!("../icons/icon.ico").to_vec(),
        ));

    let discord_rpc = DiscordRPC::new();
    let asset_manager = AssetManager::new();

    info!("Starting Tauri application");

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
        .plugin(tauri_plugin_drag::init())
        .manage(DiscordRPCState(Arc::new(Mutex::new(discord_rpc))))
        .manage(AssetManagerState(Arc::new(Mutex::new(asset_manager))))
        .manage(IsGameInstallingState(Arc::new(Mutex::new(
            GameInstallingState {
                is_installing: false,
                step: 0,
            },
        ))))
        .invoke_handler(tauri::generate_handler![
            commands::hello_world::hello_world,
            commands::utils::send_notification,
            commands::io::find_installation_path,
            commands::io::ensure_installation_path,
            commands::io::fetch_local_manifest,
            commands::io::get_executable_path,
            commands::io::uninstall_game,
            commands::io::read_screenshots,
            commands::io::get_packages_list,
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
