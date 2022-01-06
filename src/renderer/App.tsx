/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import axios from 'axios';
import Setup from './Views/Setup';
import News from './Views/Pages/News';
import Store from './Views/Pages/Store';
import Vote from './Views/Pages/Vote';
import Login from './Views/Pages/Login';
import Account from './Views/Pages/Account';
import Bugtracker from './Views/Pages/Bugtracker';
import DailyRewards from './Views/Pages/DailyRewards';
import UITest from './Views/Pages/UITest';
import { sendDownload, sendDownloadExe } from './Views/DownloadHelper';
import Home from './Views/Home';

import './App.css';

let path = window.localStorage.getItem('path');
let lastUpdated = window.localStorage.getItem('download-lastUpdated');
let currentPatchVersions = window.localStorage.getItem('patch-version');

window.electron.ipcRenderer.send('checkInstallationFolder', path);
window.electron.ipcRenderer.on('installationFolderFound', () => {
  console.log('foundfiles');
  window.localStorage.setItem('configComplete', true);
  window.electron.ipcRenderer.send('checkForPatchUpdates', {
    path,
    lastUpdated,
    currentPatchVersions,
  });
});

window.electron.ipcRenderer.on('patchUpdateFound', (patchRes) => {
  console.log('patch update res');
  console.log(patchRes);
  window.localStorage.setItem('patchUpdateRequested', true);

  patchRes.patchArr.length &&
    patchRes.patchArr.map((patch, index) => {
      window.localStorage.setItem(`patchUpdate${index + 1}Url`, patch.url);
      window.localStorage.setItem('patchUpdateRequested', true);
    });
  window.localStorage.setItem(
    'patch-version-server',
    JSON.stringify(patchRes.patchVersions)
  );
});

const getOnlineCount = (setOnlineCount) => {
  axios.get('https://wargodswow.com/api/online').then((res) => {
    setOnlineCount(res.data);
  });
};

export default function App() {
  const [downloadProgress, setDownloadProgress] = useState({
    active: false,
    progress: 0,
  });
  const [user, setUser] = useState(
    window.localStorage.getItem('user')
      ? JSON.parse(window.localStorage.getItem('user'))
      : undefined
  );
  const [dlComplete, setDlComplete] = useState(false);
  const [onlineCount, setOnlineCount] = useState('0');
  const [patchesUpdated, setPatchesUpdated] = useState(false);
  const path = window.localStorage.getItem('path');
  const patchUpdateRequested = window.localStorage.getItem(
    'patchUpdateRequested'
  );
  const launchGame = () => {
    window.electron.ipcRenderer.invoke('launchwow', path);
  };
  getOnlineCount(setOnlineCount);
  return (
    <Router>
      <div className='container-wp'>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <UITest user={user} setUser={setUser} onlineCount={onlineCount}/>
            )}
          />
          <Route path="/daily" render={() => <DailyRewards user={user} />} />
        </Switch>
      </div>
    </Router>
  );
}
