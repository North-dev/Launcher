import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import axios from 'axios';

async function fetchNewsData(setNewsData) {
  axios.get('https://wargodswow.com/api/news').then((res) => {
    console.log(res.data);
    setNewsData(res.data);
  });
}

async function fetchChangelogData(setChangelogData) {
  axios.get('https://wargodswow.com/api/changelog').then((res) => {
    setChangelogData(res.data);
  });
}
const Home = () => {
  const [newsData, setNewsData] = useState([]);
  const [changeLogData, setChangelogData] = useState([{ description: '' }]);

  if (newsData.length === 0) {
    fetchNewsData(setNewsData);
    fetchChangelogData(setChangelogData);
  }
  console.log(changeLogData);

  const clProps = {
    dangerouslySetInnerHTML: { __html: changeLogData[0].description },
  };
  return (
    <>
      <div className="swipPanel">
        <div className="swipForm newsSwip infoSwip">
          <div className="contentSwip">
            <div className="headerInfoSwip">Breaking News</div>
            <div className="contentInfo">
              {newsData.map((data) => {
                return (
                  <div key={data.title}>
                    <h2>{data.title}</h2>
                    <p>{data.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="swipForm newsSwip infoSwip">
          <div className="contentSwip">
            <div className="headerInfoSwip">Changelog</div>
            <div className="contentInfo">
              <div key={changeLogData[0].date}>
                <h2>{changeLogData[0].title}</h2>
                <br />
                <div {...clProps}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="swipPanel scroll">
        <div className="swipForm secondSwip">
          <div className="contentSwip">
            <div className="smallCard">
              Daily rewards <br />
              <br />
              <button variant="contained">Daily Rewards (disabled)</button>
            </div>
          </div>
        </div>
        <div className="swipForm secondSwip">
          <div className="contentSwip">
            <div className="smallCard">Some content / image</div>
          </div>
        </div>
        <div className="swipForm secondSwip">
          <div className="contentSwip">
            <div className="smallCard">Some content / image</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
