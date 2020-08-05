import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import axios from 'axios';
import './App.css';
import Channel from './Channel';
//import sample from './sample.json';

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
      setError(
        'Error: No channel with that ID was found or the request was not allowed.'
      );
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>SUBCEPTION</h1>
      <p>
        Find out who the YouTube channels you subscribe to (up to a maximum of 100
        channels) subscribe to.
      </p>
      <h3>
        Enter Your YouTube Channel ID
        <a href='https://www.youtube.com/account_advanced'> From Your Account</a>
      </h3>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          className='channelIdInput'
          type='text'
          placeholder='Your YouTube Channel ID'
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          required
        />
        <input className='submit ' type='submit' value='Enter' />
      </form>
      <div className='error'>{error && <p>{error}</p>}</div>
      <br />
      {channels.length > 0 ? <h2>Channels</h2> : <br />}
      {loading && (
        <div className='loading'>
          <ReactLoading type='bars' color='lightgrey' />
          <p>This might take a while.</p>
        </div>
      )}
      <div className='channels'>
        {!loading &&
          channels.map((channel) => (
            <Channel key={channel.channelId} channel={channel}></Channel>
          ))}
      </div>
    </div>
  );
};

export default App;
