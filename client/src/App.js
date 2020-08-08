import React, { useState, useEffect } from 'react';
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

  // Data for getting from and passing back to server for compound searching
  const [allSubs, setAllSubs] = useState([]);
  const [pageToken, setPageToken] = useState('');

  useEffect(() => {
    pageToken ? setAllSubsDone(false) : setAllSubsDone(true);
  }, [pageToken]);

  const onSubmit = async (e, action) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let body = {};
    if (action === 'newChannelSubmit') {
      body = { allSubs: [], output: [], pageToken: '' };
    } else if (action === 'getMoreChannels') {
      body = { allSubs, output: channels, pageToken };
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const res = await axios.post(`/api/data?channelId=${channelId}`, body, headers);
      setChannels(JSON.parse(res.data.output));
      setAllSubs(JSON.parse(res.data.allSubs));
      setPageToken(res.data.token);
      setSuccessfulChannelId(channelId);
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
        <a className='youtubeLink' href='https://www.youtube.com/account_advanced'>
          {' '}
          From Your Account
        </a>
      </h3>
      <small>
        If you are directed to the YouTube mobile app and the page is blank, please
        request the desktop website from the options to see your channel ID.
      </small>
      <form onSubmit={(e) => onSubmit(e, 'newChannelSubmit')}>
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
      {successfulChannelId !== 'none' && (
        <div>
          <h2>Channels</h2>
          <Button
            variant='outlined'
            color='secondary'
            onClick={(e) => onSubmit(e, 'getMoreChannels')}
            disabled={loading || allSubsDone}
          >
            Search through more of your subscriptions' subscriptions
          </Button>
          {channels.length === 0 && ( // Extremely unlikely to happen
            <h3>No common subscriptions' subscriptions found!</h3>
          )}
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
