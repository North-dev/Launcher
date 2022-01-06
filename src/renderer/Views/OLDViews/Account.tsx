import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

const Account = (props) => {
  const account = props.account;
  let history = useHistory();

  const handleLogout = () => {
    window.localStorage.removeItem('user');
    props.setUser();
    history.push('/');
  };
  console.log(account);
  return (
    <Card sx={{ minWidth: 275 }} className="content-card">
      <CardContent>
        <h1>Account</h1>
        <Button onClick={handleLogout}>Logout</Button>
        <Link to="/Daily">
          <Button variant="contained">Daily Rewards</Button>
        </Link>
        <p>Username {account.username}</p>
        <p>VIP {account.vip}</p>
        <p>Votes {account.votes}</p>
        <p>Email {account.email}</p>
        <p>Member Since {account.joindate}</p>
        <p>Last Ip {account.last_ip}</p>
      </CardContent>
    </Card>
  );
};

export default Account;
