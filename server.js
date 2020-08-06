const express = require('express');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const app = express();

let channelId = '';
let allSubs = [];
let output = [];
let pageToken = '';

app.get('/api/data', async (req, res) => {
  try {
    if (channelId !== req.query.channelId) {
      channelId = req.query.channelId;
      allSubs = [];
      output = [];
      pageToken = '';
    }

    // Get a maximum of 100 subscribers' subscriptions.

    pageToken = await addToOutputAndGetNextToken();
    if (pageToken) pageToken = await addToOutputAndGetNextToken();

    // Ideally, we would be able to run through every subscription like below instead,
    // but Heroku times out after 30 seconds so we can't.

    // while (token) {
    //   token = await addToOutputAndGetNextToken(allSubs, output, channelId, token);
    // }

    output.sort((a, b) => a.subbers.length - b.subbers.length).reverse();

    res.json(output);
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

app.get('/api/pageToken', async (req, res) => {
  res.json(pageToken);
});

async function addToOutputAndGetNextToken() {
  const response = await getResponse(channelId, pageToken);
  await addToOutput(response.data.items);
  return response.data.nextPageToken;
}

async function getResponse(channelId, pageToken) {
  return await google.youtube('v3').subscriptions.list({
    key: process.env.YOUTUBE_DATA_API_KEY,
    channelId,
    pageToken,
    part: 'snippet',
    maxResults: 50,
  });
}

async function addToOutput(items) {
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
    const response = await getResponse(channelId, '');
    const subs = [];
    response.data.items.forEach(({ snippet }) => {
      subs.push({
        sub: snippet.title,
        channelId: snippet.resourceId.channelId,
        thumbnail: snippet.thumbnails.default.url,
      });
    });
    return subs;
  } catch (err) {
    return null;
  }
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
