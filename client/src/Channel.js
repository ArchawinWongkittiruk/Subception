import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import './App.css';

const Channel = ({ channel }) => {
  const [subs, showSubs] = useState(false);

  return (
    <div className='channel'>
      <h2>
        <a href={'https://www.youtube.com/channel/' + channel.channelId}>
          <img className='thumbnail' src={channel.thumbnail} alt='channel-thumbnail' />
          <br />
          {channel.channel}
        </a>
      </h2>
      <Button variant='outlined' color='secondary' onClick={() => showSubs(!subs)}>
        {channel.subbers.length} Subscribers
      </Button>
      {subs && channel.subbers.map((subber) => <p key={subber}>{subber}</p>)}
    </div>
  );
};

export default Channel;
