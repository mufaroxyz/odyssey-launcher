use std::{
    fs::File,
    io::Write,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub struct AssetManager {
    mhy_launcher_cdn_images: String,
    mhy_launcher_cdn_game_resources: String,
}

pub struct AssetManagerState(pub Arc<Mutex<AssetManager>>);

#[derive(Serialize, Deserialize)]
pub struct Advertisement {
    pub background: String,
    pub icon: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Banner {
    pub banner_id: String,
    pub img: String,
    pub url: String,
}

#[derive(Serialize, Deserialize)]
pub struct Post {
    #[serde(rename = "type")]
    pub post_type: String,
    pub title: String,
    pub url: String,
    pub show_time: String,
}

#[derive(Serialize, Deserialize)]
pub struct Images {
    pub adv: Advertisement,
    pub banner: Vec<Banner>,
    pub post: Vec<Post>,
}

#[derive(Deserialize)]
pub struct ReturnedImages {
    pub data: Images,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct VoicePack {
    pub language: String,
    pub path: String,
    pub size: String,
    pub package_size: String,
    pub md5: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GameSegments {
    pub path: String,
    pub md5: String,
    pub package_size: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GameLatest {
    pub name: String,
    pub version: String,
    pub size: String,
    pub md5: String,
    pub voice_packs: Vec<VoicePack>,
    pub segments: Vec<GameSegments>,
    pub package_size: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GameLatestMiddleware {
    pub latest: GameLatest,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GameResource {
    pub game: GameLatestMiddleware,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GameResourceMiddleware {
    pub data: GameResource,
}

impl AssetManager {
    pub fn new() -> AssetManager {
        let mhy_resources = include_str!("../../metadata/mhy_resources.json");
        let mhy_resources: Value = serde_json::from_str(mhy_resources).unwrap();

        AssetManager {
            mhy_launcher_cdn_images: mhy_resources["mhy_launcher_cdn_images"]
                .as_str()
                .unwrap()
                .to_string(),
            mhy_launcher_cdn_game_resources: mhy_resources["mhy_launcher_cdn_game_resources"]
                .as_str()
                .unwrap()
                .to_string(),
        }
    }

    pub fn get_file_module_url(&self, path: &str) -> String {
        let current_dir = std::env::current_dir().unwrap();
        let current_dir = current_dir.to_str().unwrap();
        format!("{}/{}", current_dir, path)
    }

    pub fn fetch_game_resources(&self) -> GameResourceMiddleware {
        let url = &self.mhy_launcher_cdn_game_resources;

        let response = reqwest::blocking::get(url).unwrap();
        let data =
            serde_json::from_str::<GameResourceMiddleware>(&response.text().unwrap()).unwrap();

        return data;
    }

    pub fn fetch_images(&self) -> Images {
        let url = &self.mhy_launcher_cdn_images;
        // make an get request to the url

        let response = reqwest::blocking::get(url).unwrap();
        let data = serde_json::from_str::<ReturnedImages>(&response.text().unwrap())
            .unwrap()
            .data;

        let exists_assets = std::path::Path::new("assets");

        if !exists_assets.exists() {
            std::fs::create_dir("assets").unwrap();
        }
        let mut diff = Vec::new();

        for banner_diff in data.banner.clone() {
            let banner_id = banner_diff.banner_id;
            let path = format!("assets/{}.jpg", banner_id);
            let exists = std::path::Path::new(&path);
            if !exists.exists() {
                diff.push(banner_id);
            }
        }

        for banner_diff in diff {
            let mut file = File::create(format!("assets/{}.jpg", banner_diff)).unwrap();
            let downloaded_image = reqwest::blocking::get(
                data.banner
                    .iter()
                    .find(|x| x.banner_id == banner_diff)
                    .unwrap()
                    .img
                    .clone(),
            )
            .unwrap();
            let downloaded_image = downloaded_image.bytes().unwrap();
            file.write_all(&downloaded_image).unwrap();
        }

        let splash_path = "assets/background.jpg";
        let exists = std::path::Path::new(splash_path);

        if !exists.exists() {
            let downloaded_image = reqwest::blocking::get(data.adv.background).unwrap();
            let downloaded_image = downloaded_image.bytes().unwrap();

            let mut file = File::create(splash_path).unwrap();
            file.write_all(&downloaded_image).unwrap();
        }

        let advertisement = Advertisement {
            background: self.get_file_module_url("assets/background.jpg"),
            icon: data.adv.icon,
            url: data.adv.url,
        };

        let mut banners = Vec::new();
        for banner in data.banner {
            let banner = Banner {
                banner_id: banner.banner_id.clone(),
                img: self.get_file_module_url(format!("assets/{}.jpg", banner.banner_id).as_str()),
                url: banner.url,
            };
            banners.push(banner);
        }

        let mut posts = Vec::new();
        for post in data.post {
            let post = Post {
                post_type: post.post_type,
                title: post.title,
                url: post.url,
                show_time: post.show_time,
            };
            posts.push(post);
        }

        Images {
            adv: advertisement,
            banner: banners,
            post: posts,
        }
    }
}
