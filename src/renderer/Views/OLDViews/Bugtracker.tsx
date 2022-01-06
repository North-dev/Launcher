import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import axios from 'axios';

async function fetchBugData(setBugTrackerData) {
  axios.get('https://wargodswow.com/api/bugtracker').then(res => {
    setBugTrackerData(res.data);
  });
}

const Bugtracker = () => {
  const [bugTrackerData, setBugTrackerData] = useState([]);
  if(bugTrackerData.length === 0) {
    fetchBugData(setBugTrackerData);
  }
  return (
    <Card sx={{ minWidth: 275 }} className="content-card">
      <CardContent>
        <div>Bugtracker</div>
        {bugTrackerData.map((data) => {
          const props = {
            dangerouslySetInnerHTML: { __html: data.description },
          };
          return (
            <div className="bugTrackerItem" key={data.title}>
              <h2>{data.title}</h2>
              <p>Priority: {data.priority}</p>
              <p>Status: {data.status}</p>
              <p>Author: {data.author}</p>
              <div {...props}></div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Bugtracker;
