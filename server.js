const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/data', async (req, res) => {
  try {
    const allSubs = [];
    const output = [];
    const channelId = req.query.channelId;

    let token = await addToOutputAndGetNextToken(allSubs, output, channelId, '');
    // while (token) {
    //   token = await addToOutputAndGetNextToken(allSubs, output, channelId, token);
    // }

    output.sort((a, b) => a.subbers.length - b.subbers.length).reverse();

    res.json(output);
  } catch (err) {
    console.log(err);
  }
});

async function addToOutputAndGetNextToken(allSubs, output, channelId, pageToken) {
  const response = await getResponse(channelId, pageToken);
  await addToOutput(response.data.items, allSubs, output);
  return response.data.nextPageToken;
}

async function getResponse(channelId, pageToken) {
  return await google.youtube('v3').subscriptions.list({
    key: process.env.YOUTUBE_TOKEN,
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
    const response = await getResponse(channelId, '');
    const { data } = response;
    const subs = [];
    data.items.forEach(({ snippet }) => {
      subs.push({
        sub: snippet.title,
        channelId: snippet.resourceId.channelId,
        thumbnail: snippet.thumbnails.default.url,
      });
    });
    return subs;
  } catch (err) {
    if (err.response.status !== 403) console.log(err);
    return null;
  }
}

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
