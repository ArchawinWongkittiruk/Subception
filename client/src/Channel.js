import React from 'react';
import './App.css';

const Channel = ({ channel }) => {
  return (
    <div className='channel'>
      <h3>{channel.channel}</h3>
      <h4>Subscribers:</h4>
      {channel.subbers.map((subber) => (
        <p key={subber}>{subber}</p>
      ))}
    </div>
  );
};

export default Channel;
