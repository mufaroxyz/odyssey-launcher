use base64::{engine::general_purpose, Engine as _};
use serde_json::Value;

fn bytes_to_base64(bytes: &[u8]) -> String {
    let base64 = general_purpose::STANDARD.encode(bytes);
    base64
}

pub fn scrape_banner() -> Result<Value, Value> {
    let url = "https://genshin-impact.fandom.com/wiki/Version/4.4";
    let resp = reqwest::blocking::get(url).unwrap();

    if !resp.status().is_success() {
        return Err(serde_json::json!(null));
    }

    /* !SECTION
     *
     * Instead of that, use the scraper to get the file name of the banner image,
     *
     * fetch it using https://genshin-impact.fandom.com/wikia.php?controller=CuratedContent&method=getImage&title=File:FILE_NAME.png
     *                   https://static.wikia.nocookie.net/gensin-impact/images/c/c5/FILE_NAME.png/revision/latest/scale-to-width-down/1080
     *
     * save the image locally to avoid spamming fandom.
     *
     */

    let document = scraper::Html::parse_document(&resp.text().unwrap());
    let selector = scraper::Selector::parse("img[title^=Splashscreen]").unwrap();
    let banner_url = document
        .select(&selector)
        .next()
        .unwrap()
        .value()
        .attr("data-src")
        .unwrap();

    Ok(serde_json::json!({
        "banner_url": bytes_to_base64(&reqwest::blocking::get(banner_url).unwrap().bytes().unwrap())
    }))
}
