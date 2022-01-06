import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import axios from 'axios';

const Login = (props) => {
  const [details, _setDetails] = useState({ username: '', password: '' });
  const [invalidLogin, setInvalidLogin] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const stateRef = React.useRef(details);

  let history = useHistory();
  const path = window.localStorage.getItem('path');

  const setDetails = (data, type) => {
    stateRef.current[type] = data;
    let obj = {};
    obj[type] = data;
    _setDetails({ ...details, ...obj });
  };

  const handleLogin = () => {
    const bodyFormData = new FormData();
    bodyFormData.append('username', stateRef.current.username);
    bodyFormData.append('password', stateRef.current.password);
    const config = {
      method: 'post',
      url: 'https://wargodswow.com/api/login',
      headers: {
        Accept: '/',
        'Content-Type': 'multipart/form-data',
      },
      data: bodyFormData,
    };
    setLoginPending(true);

    axios(config)
      .then((res) => {
        const user = res.data;
        if (user.includes('Unauthorized403')) {
          setInvalidLogin(true);
          setLoginPending(false);
        } else {
          window.localStorage.setItem('user', user);
          props.setUser(JSON.parse(user));
          history.push('/');
          window.electron.ipcRenderer.send('setGameAccountDetails', {
            str: `\nSET accountName "${stateRef.current.username}#&|&#${stateRef.current.password}"`,
            path,
          });
        }
        return true;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleOnChange = (e, type) => {
    setDetails(e.target.value, type);
  };

  return (
    <Card sx={{ minWidth: 275 }} className="login-card">
      <CardContent>
        <div>Login</div>
        <div className="loginInput">
          {invalidLogin ? <p className="loginInvalid">Invalid Login</p> : null}
          <Input
            onChange={(e) => handleOnChange(e, 'username')}
            value={details.username}
            placeholder="Username"
            className="loginField"
          />
          <Input
            onChange={(e) => handleOnChange(e, 'password')}
            value={details.password}
            type="password"
            placeholder="Password"
            className="loginField"
          />
          {!loginPending ? (
            <Button onClick={handleLogin} className="loginButton">
              {invalidLogin ? 'Try Again' : 'Login'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
