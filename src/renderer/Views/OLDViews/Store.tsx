import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import axios from 'axios';

async function fetchStoreData(setStoreData) {
  axios.get('https://wargodswow.com/api/store_urls').then((res) => {
    setStoreData(res.data);
  });
}

const Store = () => {
  const [storeData, setStoreData] = useState([]);
  if (storeData.length === 0) {
    fetchStoreData(setStoreData);
  }
  return (
    <Card sx={{ minWidth: 275 }} className="content-card">
      <CardContent>
        <div>Store</div>
        {storeData.map((data) => {
          return (
            <div className="storeItem" key={data.name}>
              <h2>{data.name}</h2>
              <p>{data.route}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Store;
