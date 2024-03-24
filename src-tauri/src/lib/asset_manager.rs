use std::sync::{Arc, Mutex};

use serde::Serialize;
use serde_json::Value;

pub struct AssetManager {
    mhy_launcher_cdn_images: String,
    mhy_launcher_cdn_game_resources: String,
}

pub struct AssetManagerState(pub Arc<Mutex<AssetManager>>);

#[derive(Serialize)]
pub struct Advertisement {
    pub splash: String,
    pub icon: String,
    pub icon_url: String,
}

#[derive(Serialize)]
pub struct Banner {
    pub img: String,
    pub img_url: String,
}

#[derive(Serialize)]
pub struct Post {
    pub post_type: String,
    pub title: String,
    pub url: String,
    pub show_time: String,
}

#[derive(Serialize)]
pub struct Images {
    pub advertisement: Advertisement,
    pub banners: Vec<Banner>,
    pub posts: Vec<Post>,
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

    pub fn fetch_images(&self) -> Images {
        let url = &self.mhy_launcher_cdn_images;
        // make an get request to the url

        let response = reqwest::blocking::get(url).unwrap();
        let data: Value = serde_json::from_str(&response.text().unwrap()).unwrap();

        let advertisement = Advertisement {
            splash: data["data"]["adv"]["background"]
                .as_str()
                .unwrap()
                .to_string(),
            icon: data["data"]["adv"]["icon"].as_str().unwrap().to_string(),
            icon_url: data["data"]["adv"]["url"].as_str().unwrap().to_string(),
        };

        let mut banners = Vec::new();
        for banner in data["data"]["banner"].as_array().unwrap() {
            let banner = Banner {
                img: banner["img"].as_str().unwrap().to_string(),
                img_url: banner["url"].as_str().unwrap().to_string(),
            };
            banners.push(banner);
        }

        let mut posts = Vec::new();
        for post in data["data"]["post"].as_array().unwrap() {
            let post = Post {
                post_type: post["type"].as_str().unwrap().to_string(),
                title: post["title"].as_str().unwrap().to_string(),
                url: post["url"].as_str().unwrap().to_string(),
                show_time: post["show_time"].as_str().unwrap().to_string(),
            };
            posts.push(post);
        }

        Images {
            advertisement,
            banners,
            posts,
        }
    }
}
