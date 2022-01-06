const sendDownload = (url, path) => {
  window.electron.ipcRenderer.send('download', {
    url,
    properties: { directory: `${path}/Data`, overwrite: true },
  });
};
const sendDownloadExe = (url, path) => {
  window.electron.ipcRenderer.send('download', {
    url,
    properties: { directory: `${path}`, overwrite: true },
  });
};
export {sendDownload, sendDownloadExe};
