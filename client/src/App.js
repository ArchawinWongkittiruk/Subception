import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import { Button } from '@material-ui/core';
import axios from 'axios';
import './App.css';
import Channel from './Channel';
//import sample from './sample.json';

const App = () => {
  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successfulChannelId, setSuccessfulChannelId] = useState('none');
  const [allSubsDone, setAllSubsDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/data?channelId=${channelId}`);
      setChannels(res.data);
      setSuccessfulChannelId(channelId);
      const pageToken = await axios.get('/api/pageToken');
      pageToken.data ? setAllSubsDone(false) : setAllSubsDone(true);
    } catch (err) {
      setError(err.response.data);
      setChannels([]);
      setSuccessfulChannelId('none');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>SUBCEPTION</h1>
      <p>Find out who the YouTube channels you subscribe to subscribe to.</p>
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
        <input
          className='submit'
          type='submit'
          value='Enter'
          disabled={loading || channelId === successfulChannelId}
        />
      </form>
      {error && <p>{error}</p>}
      {channels.length > 0 && (
        <div>
          <h2>Channels</h2>
          <Button
            variant='outlined'
            color='secondary'
            onClick={(e) => onSubmit(e)}
            disabled={loading || allSubsDone}
          >
            See even more of your subscriptions' subscriptions
          </Button>
        </div>
      )}
      {loading ? (
        <div className='loading'>
          <ReactLoading type='bars' color='lightgrey' />
          <p>This might take a while.</p>
        </div>
      ) : (
        <div className='channels'>
          {channels.map((channel) => (
            <Channel key={channel.channelId} channel={channel}></Channel>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
