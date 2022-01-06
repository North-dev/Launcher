import { useState } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

const DownloadProgress = (dl) => {
  return (
    <>
      <div className="downloadBarContainer">
        {dl.download.active ? (
          <div className="downloadBar">
            <div className="meter orange nostripes">
              <span style={{ width: `${dl.download.progress}%` }} />
              <h1>Patch Download Progress: {dl.download.progress}%</h1>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const Home = (props) => {
  const [download, setDownload] = useState({ active: false, progress: 0 });
  const [patchesDownloading, setPatchesDownloading] = useState(false);
  const [patchesInstalled, setPatchesInstalled] = useState(false);

  const path = window.localStorage.getItem('path');
  const dl1 = window.localStorage.getItem('download-0');
  const dl2 = window.localStorage.getItem('download-1');
  const dl3 = window.localStorage.getItem('download-2');

  const handleClick = () => {
    setPatchesDownloading(true);
    let runOnce = false;
    window.localStorage.setItem('configComplete', false);
    axios.get('https://wargodswow.com/api/patch').then((res) => {
      const patchUrls = res.data;
      const existingPatches = JSON.parse(
        window.localStorage.getItem('patch-version')
      );
      patchUrls.map((patch) => {
        console.log(patch)
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
      setDownload({
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
      setDownload({
        progress: cleanProgressInPercentages,
        active: cleanProgressInPercentages !== 100,
      });
      if (cleanProgressInPercentages === 100) {
        setPatchesInstalled(true);
        window.localStorage.setItem('download', cleanProgressInPercentages);
        window.localStorage.setItem('download-lastUpdated', Date.now());
        window.localStorage.setItem('configComplete', true);
      }
    });
  };
  return (
    <div>
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div id="wowMain" className="mainPanel">
        <div className="gameLogo wowGl"></div>
        <div className="swipPanel">
          <div className="swipForm newsSwip infoSwip">
            <div className="contentSwip">
              <div className="headerInfoSwip">Breaking News</div>
              <div className="contentInfo"></div>
            </div>
          </div>
          <div className="swipForm changelogSwip">
            <div className="contentSwip"></div>
          </div>
        </div>
        <div className="swipPanel">
          <div className="swipForm mainSwip">
            <div className="contentSwip">
              <video
                className="VideoPane-video"
                src="https://bnetcmsus-a.akamaihd.net/cms/template_resource/va/VA9SUIEWCPDW1579209052901.mp4"
                loop="loop"
                muted="muted"
                autoplay="autoplay"
                playsinline="playsinline"
              ></video>
            </div>
          </div>
          <div className="swipForm secondSwip">
            <div className="contentSwip"></div>
          </div>
        </div>
      </div>
    </div>
      <Card sx={{ minWidth: 275 }} className="welcome-card">
        <CardContent>
          Please click the button below to download and install the necessary
          Patches
          <br />
          <br />
          Directory selected:
          <br />
          <br />
          {path}
          <br />
          <br />
        </CardContent>
        <CardActions>
          {!patchesDownloading ? (
            <Button variant="contained" onClick={handleClick}>
              Install Patches
            </Button>
          ) : null}
          {patchesInstalled && !props.user ? (
            <Link to="/login">
              <Button variant="contained">Login</Button>
            </Link>
          ) : null}
          {patchesInstalled && props.user ? (
            <Link to="/">
              <Button variant="contained">Home</Button>
            </Link>
          ) : null}
        </CardActions>
      </Card>
      <DownloadProgress download={download} />
    </div>
  );
};

export default Home;
