import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

const Account = (props) => {
  const account = props.user;
  let history = useHistory();

  const handleLogout = () => {
    window.localStorage.removeItem('user');
    props.setUser();
    history.push('/');
  };
  console.log(account);
  return (
    <div className="swipPanel">
        <div className="swipForm newsSwip infoSwip">
          <div className="contentSwip">
            <div className="headerInfoSwip">Bugs</div>
            <div className="contentInfo">
            <h1>Account</h1>
              <button onClick={handleLogout}>Logout</button>
              <p>Username {account.username}</p>
              <p>VIP {account.vip}</p>
              <p>Votes {account.votes}</p>
              <p>Email {account.email}</p>
              <p>Member Since {account.joindate}</p>
              <p>Last Ip {account.last_ip}</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Account;
