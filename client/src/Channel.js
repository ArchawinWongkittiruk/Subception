import React from 'react';
import './App.css';

const Channel = ({ channel }) => {
  return (
    <div className='channel'>
      <h3>
        <a href={'https://www.youtube.com/channel/' + channel.channelId}>
          <img src={channel.thumbnail} alt='channel-thumbnail' />
          <br />
          {channel.channel}
        </a>
      </h3>
      <h4>Subscribers:</h4>
      {channel.subbers.map((subber) => (
        <p key={subber}>{subber}</p>
      ))}
    </div>
  );
};

export default Channel;
