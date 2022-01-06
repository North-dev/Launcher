import { useState } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

export default function Setup() {
  const history = useHistory();
  const [hasPatch, setHasPatch] = useState(false);

  const handleClick = () => {
    window.electron.ipcRenderer.invoke('dialog', (res) => {
      // eslint-disable-next-line no-console
      window.localStorage.setItem('path', res);
      history.push('/home');
      window.electron.ipcRenderer.invokeOnce('checkInstallationFolder', path);
    });
  };

  if (hasPatch) {
    console.log('redirecting');
    return <Redirect to="/" />;
  }
  return (
    <>
      <Card sx={{ minWidth: 275 }} className="welcome-card">
        <CardContent>
          Please use the button below to select the root of your fresh WoW
          Installation
          <br />
          <br />
          Note: If you're using an existing installation you will need to delete
          all of the old data manually, this launcher does not support a
          migration from another server.
        </CardContent>
        <CardActions>
          <Button onClick={handleClick}>Select WoW Directory</Button>
        </CardActions>
      </Card>
    </>
  );
}
