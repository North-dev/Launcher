import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import axios from 'axios';

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
    <>
      <div className="fullPanel">
          <div className="contentSwip">
            <div className="headerInfoSwip">Vote</div>
            <div className="contentInfo">
              {voteData.map((data) => {
                return (
                  <div className="storeItem" key={data.name}>
                    <h2>{data.name}</h2>
                    <p>{data.url}</p>
                    <img src="data.image"></img>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </>
  );
};

export default Vote;
