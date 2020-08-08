const express = require('express');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// It makes way more sense to use a get method, but we need to pass in a body
// so a post method will have to do.
app.post('/api/data', async (req, res) => {
  try {
    const channelId = req.query.channelId;
    const allSubs = req.body.allSubs;
    const output = req.body.output;
    let token = req.body.pageToken;

    // Get a maximum of 50 subscriptions' subscriptions at a time.
    const response = await getResponse(channelId, token);
    token = response.data.nextPageToken;

    // Send the output, complete or not, after no more than 25 seconds to prevent
    // the Heroku server request from timing out after the 30 second limit.

    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), 25000);
    });

    const complete = new Promise(async (resolve) => {
      await addToOutput(response.data.items, allSubs, output);
      resolve('complete');
    });

    Promise.race([timeout, complete]).then(() => {
      output.sort((a, b) => b.subbers.length - a.subbers.length);
      res.send({
        token,
        allSubs: JSON.stringify(allSubs),
        output: JSON.stringify(output),
      });
    });
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json('No channel with that ID was found.');
    } else if (err.code === 403) {
      return res.status(403).json("This channel's subscriptions are private.");
    } else {
      return res.status(400).json('Error');
    }
  }
});

async function getResponse(channelId, pageToken) {
  return await google.youtube('v3').subscriptions.list({
    key: process.env.YOUTUBE_DATA_API_KEY,
    channelId,
    pageToken,
    part: 'snippet',
    maxResults: 50,
  });
}

async function addToOutput(items, allSubs, output) {
  for (const { snippet } of items) {
    const subs = await getSubs(snippet.resourceId.channelId);

    if (subs) {
      subs.forEach(({ sub, channelId, thumbnail }) => {
        const entry = { subber: snippet.title, subbee: sub };
        allSubs.push(entry);
        const commons = allSubs.filter((entry) => entry.subbee === sub);

        if (commons.length > 1) {
          const match = output.findIndex(({ channel }) => channel === sub);

          if (match !== -1) {
            output[match].subbers.push(entry.subber);
          } else {
            output.push({
              channel: sub,
              channelId,
              thumbnail,
              subbers: commons.map((common) => common.subber),
            });
          }
        }
      });
    }
  }
}

async function getSubs(channelId) {
  try {
    const subs = [];

    // Look for a maximum of 200 subscriptions.
    // 200 because it is something of a sweet spot between speed and completeness.
    let token = await addToSubsAndGetNextToken(subs, channelId, '');
    if (token) token = await addToSubsAndGetNextToken(subs, channelId, token);
    if (token) token = await addToSubsAndGetNextToken(subs, channelId, token);
    if (token) await addToSubsAndGetNextToken(subs, channelId, token);

    return subs;
  } catch (err) {
    return null;
  }
}

async function addToSubsAndGetNextToken(subs, channelId, pageToken) {
  const response = await getResponse(channelId, pageToken);
  response.data.items.forEach(({ snippet }) => {
    subs.push({
      sub: snippet.title,
      channelId: snippet.resourceId.channelId,
      thumbnail: snippet.thumbnails.default.url,
    });
  });
  return response.data.nextPageToken;
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
