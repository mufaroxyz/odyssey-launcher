import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TauriPayload, TauriResponse, TauriRoutes, GlobalResponseError } from './ptypes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function tauriInvoke<R extends TauriRoutes, P = TauriResponse[R] extends void ? never : TauriPayload[R]>(
  route: R,
  payload?: P,
): Promise<TauriResponse[R]> {
  const response = (await invoke(route, payload as InvokeArgs)) as GlobalResponseError | TauriResponse[R];

  // @ts-expect-error - This is either a error or a response
  if ('error' in response) {
    throw new Error(response.error);
  }

  return response as TauriResponse[R];
}

export function prettifyBytes(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) {
    return '0 Byte';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
