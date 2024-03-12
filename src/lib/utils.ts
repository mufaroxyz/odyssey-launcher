import { invoke } from "@tauri-apps/api/tauri";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function JSONInvoke<T>(route: string, payload: any): Promise<T> {
  return await invoke<T>(route, payload).then(async (res) => {
    console.log(res);
    return (await JSON.parse(res as string)) as T;
  });
}

export async function scrapeBanner() {
  const url = "https://twitter.com/GenshinImpact";
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(text, "text/html");
  // i need to find a div that has a class: "background-image: url('*/profile_banners/*')" and then extract the url
  const divs = htmlDocument.querySelectorAll("div");
  const bannerDiv = Array.from(divs).find((div) => {
    return div.style.backgroundImage.includes("profile_banners");
  });
  if (bannerDiv) {
    return bannerDiv.style.backgroundImage;
  }
}
