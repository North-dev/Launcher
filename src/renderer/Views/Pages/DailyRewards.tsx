import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import axios from 'axios';

const DailyRewards = (props) => {
  const noRewards = window.localStorage.getItem('no-rewards');
  const [claimStatus, setClaimStatus] = useState();
  const [claimPending, setClaimPending] = useState(false);
  const [noRewardsRemaining, setNoRewardsRemaining] = useState(noRewards);
  const [charData, setCharData] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState();

  let history = useHistory();

  const getChars = () => {
    const bodyFormData = new FormData();
    bodyFormData.append('acc', props.user.id);
    const config = {
      method: 'post',
      url: 'https://wargodswow.com/api/chars',
      headers: {
        Accept: '/',
        'Content-Type': 'multipart/form-data',
      },
      data: bodyFormData,
    };

    axios(config)
      .then((res) => {
        const user = JSON.parse(res.data);
        setCharData(user);
        setSelectedCharacter(user[0].guid);
        return true;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function hashAsync(algo, str) {
    return crypto.subtle
      .digest(algo, new TextEncoder('utf-8').encode(str))
      .then((buf) => {
        return Array.prototype.map
          .call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
          .join('');
      });
  }

  const getClaimedRewards = () => {
    const one = window.localStorage.getItem('daily-rewards-1-claimed');
    const seven = window.localStorage.getItem('daily-rewards-7-claimed');
    const thirty = window.localStorage.getItem('daily-rewards-30-claimed');

    if (one && !seven) {
      window.localStorage.setItem('daily-rewards-7-claimed', true);
      return '7d';
    } else if (one && seven && !thirty) {
      window.localStorage.setItem('daily-rewards-30-claimed', true);
      return '30d';
    } else if (one && seven && thirty) {
      setNoRewardsRemaining(true);
      window.localStorage.setItem('no-rewards', true);
      return '';
    }
    window.localStorage.setItem('daily-rewards-1-claimed', true);
    return '1d';
  };

  const handleClaim = async () => {
    if (noRewards || noRewardsRemaining) {
      return;
    }
    const rewardDay = getClaimedRewards();
    console.log(rewardDay);
    const bodyFormData = new FormData();
    bodyFormData.append(
      'hash',
      await hashAsync(
        'SHA-256',
        `//${rewardDay}/$*${selectedCharacter}//`
      ).then((o) => o)
    );
    bodyFormData.append('charid', selectedCharacter);
    const config = {
      method: 'post',
      url: 'https://wargodswow.com/api/purchase',
      headers: {
        Accept: '/',
        'Content-Type': 'multipart/form-data',
      },
      data: bodyFormData,
    };

    setClaimPending(true);

    axios(config)
      .then((res) => {
        const claim = res.data;
        if (claim == '"success"') {
          setClaimStatus(true);
          setClaimPending(false);
          window.localStorage.setItem('lastClaimTime', Date.now());
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (charData.length === 0) {
    getChars();
  }

  return (
    <Card sx={{ minWidth: 275 }} className="login-card">
      <CardContent>
        <div>Claim daily rewards</div>
        {noRewardsRemaining ? (
          <p>No rewards remaining</p>
        ) : (
          <>
            <p>
              {claimStatus ? 'Claimed!' : 'Next reward claim in NUMSECONDS'}
            </p>
            <div className="loginInput">
              <select onChange={(e) => setSelectedCharacter(e.target.value)}>
                {charData.map((char) => {
                  return <option value={char.guid}>{char.name}</option>;
                })}
              </select>
              {claimPending ? null : (
                <Button onClick={handleClaim} className="loginButton">
                  Claim
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyRewards;
