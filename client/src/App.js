import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Channel from './Channel';

const App = () => {
  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.get(`/api/data?channelId=${channelId}`);
    setChannels(res.data);
  };

  return (
    <div>
      <h1>Subception</h1>
      <p>Find out who the YouTube channels you subscribe to subscribe to.</p>
      <div>
        <h3>Enter Your YouTube Channel ID</h3>
        <form onSubmit={(e) => onSubmit(e)}>
          <input
            type='text'
            placeholder='Your YouTube Channel ID'
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            required
          />
          <input type='submit' value='Submit' />
        </form>
      </div>
      <h2>Channels</h2>
      <div>
        {channels.map((channel) => (
          <Channel key={channel.channelId} channel={channel}></Channel>
        ))}
      </div>
    </div>
  );
};

export default App;
