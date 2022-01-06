import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import axios from 'axios';
import { useState } from 'react';

async function fetchVotes(setVoteData) {
  axios.get('https://wargodswow.com/api/votes').then((res) => {
    setVoteData(res.data);
  });
}

const Vote = () => {
  const [voteData, setVoteData] = useState([]);
  if (voteData.length === 0) {
    fetchVotes(setVoteData);
  }
  return (
    <Card sx={{ minWidth: 275 }} className="content-card">
      <CardContent>
        <div>Vote</div>
        {voteData.map((data) => {
          return (
            <div className="storeItem" key={data.name}>
              <h2>{data.name}</h2>
              <p>{data.url}</p>
              <img src="data.image"></img>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Vote;
