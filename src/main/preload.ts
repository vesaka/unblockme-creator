import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message:string) => ipcRenderer.send('message', message),
  post: async (path: string, data: any) => ipcRenderer.invoke('post', path, data),
  get: async (path: string, data: any) => ipcRenderer.invoke('get', path, data),
})
