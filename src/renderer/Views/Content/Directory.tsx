import { useState } from 'react';
import axios from 'axios';

const Directory = (props) => {
  const [path, setPath] = useState();
  const [download, setDownload] = useState({ active: false, progress: 0 });
  const [patchesDownloading, setPatchesDownloading] = useState(false);
  const [patchesInstalled, setPatchesInstalled] = useState(false);

  const handleClick = () => {
    window.electron.ipcRenderer.invoke('dialog', (res) => {
      // eslint-disable-next-line no-console
      window.localStorage.setItem('path', res);
      setPath(res);
      window.electron.ipcRenderer.invokeOnce('checkInstallationFolder', res);
    });
  };

  const handleInstall = () => {
    setPatchesDownloading(true);
    let runOnce = false;
    window.localStorage.setItem('configComplete', false);
    axios.get('https://wargodswow.com/api/patch').then((res) => {
      const patchUrls = res.data;
      const existingPatches = JSON.parse(
        window.localStorage.getItem('patch-version')
      );
      patchUrls.map((patch) => {
        console.log(patch);
        window.electron.ipcRenderer.send('download', {
          url: patch.url,
          properties: { directory: `${path}/Data`, overwrite: true },
        });
        let patchData = existingPatches || {};
        patchData[patch.fileName] = patch.patchVersion;
        window.localStorage.setItem('patch-version', JSON.stringify(patchData));
      });
    });

    window.electron.ipcRenderer.on('download-progress', (progress) => {
      const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
      props.setDownloadProgress({
        progress: cleanProgressInPercentages,
        active: cleanProgressInPercentages !== 100,
      });
      if (cleanProgressInPercentages === 100) {
        window.localStorage.setItem('download', cleanProgressInPercentages);
        window.localStorage.setItem('download-lastUpdated', Date.now());
        if (runOnce === false) {
          window.electron.ipcRenderer.send('download-exe', {
            url: 'http://92.48.105.95/Wow.exe',
            properties: { directory: `${path}/`, overwrite: true },
          });
          runOnce = true;
        }
      }
    });

    window.electron.ipcRenderer.on('download-exe', (progress) => {
      const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
      props.setDownloadProgress({
        progress: cleanProgressInPercentages,
        active: cleanProgressInPercentages !== 100,
      });
      if (cleanProgressInPercentages === 100) {
        setPatchesInstalled(true);
        window.localStorage.setItem('download', cleanProgressInPercentages);
        window.localStorage.setItem('download-lastUpdated', Date.now());
        window.localStorage.setItem('configComplete', true);
      }
      props.setActionButtonDisabled(false);
    });
  };

  return (
    <>
      <div className="swipPanel">
        <div className="swipForm newsSwip infoSwip">
          <div className="contentSwip">
            <div className="headerInfoSwip">Select your WoW Directory</div>
            <div className="contentInfo">
              {path ? (
                <>
                  <p>Path selected: {path}</p>
                  <br />
                  {!patchesDownloading ? (
                    <>
                      <button onClick={handleClick}>Change path</button>
                      <br />
                      <br />
                      <button onClick={handleInstall}>
                        Install Patches
                      </button>
                    </>
                  ) : null}

                  {patchesInstalled && !props.user ? (
                    <button onClick={() => props.setActiveTab(4)}>
                      Login
                    </button>
                  ) : null}
                  {patchesInstalled && props.user ? (
                    <button onClick={() => props.setActiveTab(0)}>
                      Home
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <p>
                    Please ensure that your selected directory is the root of
                    your WOTLK installation, this is to ensure that all files
                    are downloaded to the correct folders.
                  </p>
                  <br />
                  <button onClick={handleClick}>Select</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Directory;
