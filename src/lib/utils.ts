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
