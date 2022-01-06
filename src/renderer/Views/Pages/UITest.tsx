import React, { useState } from 'react';
import axios from 'axios';
import Home from '../Content/Home';
import Store from '../Content/Store';
import Vote from '../Content/Vote';
import Login from '../Content/Login';
import Account from '../Content/Account';
import BugTracker from '../Content/Bugtracker';
import Directory from '../Content/Directory';
import { sendDownload, sendDownloadExe } from '../DownloadHelper';
import './ui.css';

const UITest = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [accountMenuActive, setAccountMenuActive] = useState(false);
  const [actionButtonDisabled, setActionButtonDisabled] = useState(false);
  const path = window.localStorage.getItem('path');
  const configComplete = window.localStorage.getItem('configComplete');
  const patchUpdateRequested = window.localStorage.getItem(
    'patchUpdateRequested'
  );
  const [downloadProgress, setDownloadProgress] = useState({
    active: false,
    progress: 0,
  });
  const [dlComplete, setDlComplete] = useState(false);
  const [onlineCount, setOnlineCount] = useState('0');
  const [patchesUpdated, setPatchesUpdated] = useState(false);

  const patchUpdate = () => {
    const configComplete = window.localStorage.getItem('configComplete');
    const path = window.localStorage.getItem('path');
    const patchUpdateRequested = window.localStorage.getItem(
      'patchUpdateRequested'
    );
    setActionButtonDisabled(true);

    const patch1Url = window.localStorage.getItem('patchUpdate1Url');
    const patch2Url = window.localStorage.getItem('patchUpdate2Url');
    const serverVersion = window.localStorage.getItem('patch-version-server');

    if (patch1Url?.length > 0 && !props.patchesUpdated) {
      sendDownload(patch1Url, path);
    } else {
      return;
    }

    window.electron.ipcRenderer.on('download-progress', (progress) => {
      const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
      setDownloadProgress({
        progress: cleanProgressInPercentages,
        active: cleanProgressInPercentages !== 100,
      });
      if (cleanProgressInPercentages === 100) {
        setPatchesUpdated(true);
      }
      if (cleanProgressInPercentages === 100) {
        setPatchesUpdated(true);
        setActionButtonDisabled(false);
        window.localStorage.setItem('download', cleanProgressInPercentages);
        window.localStorage.setItem('download-lastUpdated', Date.now());
        window.localStorage.setItem('patch-version', serverVersion);
        window.localStorage.setItem('patchUpdateRequested', false);
      }
    });
  };

  const launchGame = () => {
    window.electron.ipcRenderer.invoke('launchwow', path);
  };

  const clearAllData = () => {
    window.localStorage.clear();
  };

  const launchSetup = () => {
    setActiveTab(6);
    setActionButtonDisabled(true);
  };

  const renderContent = (ind) => {
    switch (ind) {
      default:
      case 0: {
        return <Home />;
      }
      case 1: {
        return <Store />;
      }
      case 2: {
        return <Vote />;
      }
      case 3: {
        return <BugTracker />;
      }
      case 4: {
        return <Login setUser={props.setUser} setActiveTab={setActiveTab} />;
      }
      case 5: {
        return <Account user={props.user} />;
      }
      case 6: {
        return (
          <Directory
            setActiveTab={setActiveTab}
            user={props.user}
            setDownloadProgress={setDownloadProgress}
            setActionButtonDisabled={setActionButtonDisabled}
          />
        );
      }
    }
  };
  return (
    <body>
      <div id="mainForm">
        <div className="betaRibbon"></div>
        <div className="windowDecoration">
          <div className="corner1"></div>
          <div className="elm1" style={{ width: '87%' }}></div>
          <div className="corner2"></div>
        </div>
        <div className="topPanel">
          <div id="logoBN" className="topPanelItem logoBN"></div>
          <div
            id="homeBtn"
            className={`topPanelItem textMenu ${
              activeTab === 0 ? 'activeMenu' : ''
            }`}
            onClick={() => setActiveTab(0)}
          >
            Games
          </div>
          <div
            className={`topPanelItem textMenu ${
              activeTab === 1 ? 'activeMenu' : ''
            }`}
            onClick={() => setActiveTab(1)}
          >
            Store
          </div>
          <div
            className={`topPanelItem textMenu ${
              activeTab === 2 ? 'activeMenu' : ''
            }`}
            onClick={() => setActiveTab(2)}
          >
            Vote
          </div>
          <div
            className={`topPanelItem textMenu ${
              activeTab === 3 ? 'activeMenu' : ''
            }`}
            onClick={() => setActiveTab(3)}
          >
            Bug Report
          </div>
        </div>
        <div className="socialBox">
          <div className="socialPP">
            <div id="userStatut" className="socialStatut onlineIcn"></div>
          </div>
          <div id="socialPicBorder" className="socialItm"></div>
          {props?.user?.username ? (
            <a
              className="focusProfile"
              onClick={() => setAccountMenuActive(!accountMenuActive)}
            >
              <div id="socialProfile" className="socialItm">
                {props.user.username}
              </div>
            </a>
          ) : configComplete ? (
            <a className="focusProfile" onClick={() => setActiveTab(4)}>
              <div id="socialProfile" className="socialItm">
                Login
              </div>
            </a>
          ) : null}
          {/* <a className="focusNotifs">
            <div id="socialNotifs" className="socialItm">
              1
            </div>
          </a> */}
          {props?.user ? (
            <a className="focusFriends">
              <div className="socialItm socialVip">
                {props.user.vip > 0 ? `VIP ${props.user.vip}` : ''}
              </div>
            </a>
          ) : null}
          <a className="focusFriends">
            <div id="socialFriends" className="socialItm">
              {props.onlineCount}
            </div>
          </a>
        </div>
        <div id="socialMenu" className="blizzMenu">
          <div className="blizzMenuArrow"></div>
          <div className="blizzMenuItem noFocus socialInfos">
            {/* <a className="socialNickname">{props?.user.username}</a> */}
          </div>
          <div className="blizzMenuItemSpacer"></div>
          <div className="blizzMenuItem">
            <a>Player 1</a>
          </div>
          <div className="blizzMenuItemSpacer"></div>
          <div className="blizzMenuItem">
            <a>Player 2</a>
          </div>
        </div>
        <div
          id="mainMenu"
          className={`blizzMenu`}
          style={{ display: accountMenuActive ? 'block' : 'none' }}
        >
          <div className="blizzMenuArrow"></div>
          <div className="blizzMenuItem itm01">
            <a onClick={() => setActiveTab(5)}>Account management</a>
          </div>
          <div className="blizzMenuItem itm02">
            <a>Support</a>
          </div>
          <div className="blizzMenuItem itm03">
            <a>Settings</a>
          </div>
          <div className="blizzMenuItemSpacer"></div>
          <div className="blizzMenuItem itm07">
            <a>Log Out</a>
          </div>
        </div>
        <div id="sortable" className="leftPanel">
          <div className="leftPanelTitle">Wargods WoW</div>
          <div id="wowBtn" className="leftPanelItem wowLogo actlftPnlItm">
            255 Funserver
          </div>
          <div
            id="wowBtn"
            onClick={clearAllData}
            className="leftPanelItem wowLogo"
          >
            Debug: Clear
          </div>
        </div>
        <div id="wowMain" className="mainPanel">
          {/* <div className="gameLogo wowGl"></div> */}
          {renderContent(activeTab)}
          <div className="bottomPanel">
            <div className="downloadBarContainer">
              {downloadProgress.active ? (
                <div className="downloadBar">
                  <div className="meter orange nostripes">
                    <span style={{ width: `${downloadProgress.progress}%` }} />
                    <h1>
                      Patch Download Progress: {downloadProgress.progress}%
                    </h1>
                  </div>
                </div>
              ) : null}
            </div>
            {patchUpdateRequested === 'true' ? (
              <>
                <button
                  className="playButton"
                  disabled={actionButtonDisabled}
                  onClick={patchUpdate}
                >
                  Update
                </button>
              </>
            ) : configComplete ? (
              <button
                className="playButton"
                disabled={actionButtonDisabled}
                onClick={launchGame}
              >
                Play
              </button>
            ) : (
              <button
                className="playButton"
                disabled={actionButtonDisabled}
                onClick={launchSetup}
              >
                Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </body>
  );
};

export default UITest;
