# Genshin Loader

> [!NOTE]  
> This launcher is still WIP and doesn't differ much from the official one yet (Besides better UI). You still need to have the game installed from the official launcher to migrate to this one

## Download

You can download the latest release from the [GitHub releases page](https://github.com/mufaroxyz/genshin-loader/releases/latest).

## Features
- [x] Launching Game
- [x] Installing game
- [/] Updating Game
- [x] Playing time
- [ ] Built-in FPS Unlocker
- [ ] Mod Management (Using Game Banana)

## Errors

If you encounter any errors, please open an issue with the error message and the steps to reproduce the error.
Remember to prompt the log file located at the launcher's directory.

Here are some common errors and how to fix them:

### Error: `Always tries to install 7zip on startup`

Open the `cmd` and run the following command:

```bash
winget
```

It should output a confirmation prompt for agreeing to the license, simply type `Y` and press enter.

## Development

This project was bootstrapped with Tauri. Uses Typescript + React + Rust. 

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Credits

- [an-anime-team/anime-game-core](https://github.com/an-anime-team/anime-game-core) - For the implementation of installing the game
