const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopBridge", {
  openSaveDialog: () => ipcRenderer.invoke("system:save-dialog")
});
