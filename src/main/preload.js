const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    invoke(channel, func) {
      const validChannels = ['dialog', 'download'];
      if (channel === 'launchwow') {
        ipcRenderer.invoke(channel, func);
      } else {
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`
          ipcRenderer.invoke(channel).then((res) => func(res));
        }
      }
    },
    send(channel, args) {
      const validChannels = ['ipc-example', 'download', 'download-exe', 'checkInstallationFolder', 'checkForPatchUpdates', 'setGameAccountDetails'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        console.log(`found event send: ${channel}`);
        ipcRenderer.send(channel, (event, args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example', 'download'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
