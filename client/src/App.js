import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import axios from 'axios';
import './App.css';
import Channel from './Channel';
import sample from './sample.json';

const App = () => {
  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/data?channelId=${channelId}`);
      setChannels(res.data);
    } catch (err) {
      setError('Error: No channel with that ID found.');
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Subception</h1>
      <p>Find out who the YouTube channels you subscribe to subscribe to.</p>
      <div>
        <h3>Enter Your YouTube Channel ID</h3>
        <form onSubmit={(e) => onSubmit(e)}>
          <input
            className='channelIdInput'
            type='text'
            placeholder='Your YouTube Channel ID'
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            required
          />
          <input type='submit' value='Submit' />
        </form>
        <div className='error'>{error && <p>{error}</p>}</div>
      </div>
      <h2>Channels</h2>
      {loading && (
        <div className='loading'>
          <ReactLoading type='spokes' color='lightgrey' />
          <p>This might take a while.</p>
        </div>
      )}
      <div>
        {!loading &&
          sample.map((channel) => (
            <Channel key={channel.channelId} channel={channel}></Channel>
          ))}
      </div>
    </div>
  );
};

export default App;
