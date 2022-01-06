import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import axios from 'axios';

async function fetchNewsData(setNewsData) {
  axios.get('https://wargodswow.com/api/news').then(res => {
    console.log(res.data)
    setNewsData(res.data);
  });
}

async function fetchChangelogData(setChangelogData) {
  axios.get('https://wargodswow.com/api/changelog').then(res => {
    setChangelogData(res.data);
  });
}

const News = () => {
  const [newsData, setNewsData] = useState([]);
  const [changeLogData, setChangelogData] = useState([{description: ''}]);
  if(newsData.length === 0){
    fetchNewsData(setNewsData);
    fetchChangelogData(setChangelogData);
  }

  const props = {
    dangerouslySetInnerHTML: { __html: changeLogData[0].description },
  };
  return (
    <div className="card-multi">
      <Card sx={{ minWidth: 275 }} className="content-card">
        <CardContent>
          <div>News</div>
          <>
            <h2>{changeLogData[0].title}</h2>
            <div {...props}></div>
          </>
        </CardContent>
      </Card>
      <Card sx={{ minWidth: 275 }} className="content-card">
        <CardContent>
          {newsData.map((data) => {
            return (
              <>
                <h2>{data.title}</h2>
                <p>{data.description}</p>
              </>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default News;
