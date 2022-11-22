import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import fetch from 'cross-fetch';
import express from 'express';
import { Client } from "twitter-api-sdk";
import _ from 'lodash';

dotenv.config()
const app = express()
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const PORT = process.env.PORT || 4242

const getToken = async ({ consumer_key, consumer_secret }) => {
  const res = await fetch('https://api.twitter.com/oauth2/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      'Content-type': 'Content-type: application/x-www-form-urlencoded; charset: utf-8',
      'Authorization': 'Basic ' + btoa(`${consumer_key}:${consumer_secret}`)
    },
  })
  const { access_token } = await res.json();
  return access_token
}

app.post('/takeScreenshot', async (req, res) => {
  const url = req.body?.kwArgs?.url || 'https://twitter.com/trekkinglemon/status/1594946796354408448'
  const token = req?.body?.context?.keys?.screenshotapi?.['API_TOKEN'] || process.env.SCREENSHOT_API_TOKEN
  const endpoint = `https://shot.screenshotapi.net/screenshot?`+ new URLSearchParams({
    token,
    // wait_for_event: 'load',
    output: 'image',
    file_type: 'png',
    url
  })
  try {
    const rawResult = await fetch(endpoint)
    const value = [
      [ rawResult.url ]
    ]
    res.send(JSON.stringify({ value }));
  } catch(err) {
    console.error('error', err)
  }
})

app.post('/createNotionPage', async (req, res) => {
  const API_KEY = req?.body?.context?.keys?.notion?.['API_TOKEN'] || process.env.NOTION_API_TOKEN
  const tweetURL = req.body?.kwArgs?.tweetURL || 'https://twitter.com/trekkinglemon/status/1594946796354408448'
  const database_id = req.body?.kwArgs?.database_id || "9d5ceee5fe7b4cf6b3d17b570f22f0d9"
  const screenshotURL = req.body?.kwArgs?.screenshotURL || "https://screenshotapi-dot-net.storage.googleapis.com/twitter_com_trekkinglemon_status_15949467963544084_5eca30f16256.png"

  var myHeaders = {
    "Content-Type": "application/json",
    "Notion-Version": "2022-02-22",
    "Authorization": `Bearer ${API_KEY}`
  }

  var raw = JSON.stringify({
    "parent": {
      "database_id": database_id 
    },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": "New Demo Article 001"
            }
          }
        ]
      },
      "Tweet URL": {
        "type": "url",
        "url": tweetURL
      },
      "Screenshot": {
        "type": "files",
        "files": [
          {
            "name": "Demo screenshot",
            "external": {
              "url": screenshotURL
            }
          }
        ]
      }
    }
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    const apiRequest = await fetch("https://api.notion.com/v1/pages/", requestOptions)
    const data = await apiRequest.json()
    const value = [
      [ data.url ],
    ]
    res.send(JSON.stringify({ value }));
  } catch(err) {
    console.error('error', err)
  }
})

app.post('/getTweet', async (req, res) => {
  // const token = await getToken({ 
  //   consumer_key: req?.body?.context?.keys?.twitter?.['TWITTER_API_CONSUMER_KEY'],
  //   consumer_secret: req?.body?.context?.keys?.twitter?.['TWITTER_API_CONSUMER_SECRET'],
  // })
  const token = req?.body?.context?.keys?.twitter?.['TWITTER_BEARER_TOKEN'] || process.env.TWITTER_BEARER_TOKEN
  const headers = {
    'Authorization': `Bearer ${token}`
  }
  var requestOptions = { method: 'GET', headers: headers, redirect: 'follow' };
  const tweetID = req.body?.kwArgs?.id
  const url = `https://api.twitter.com/2/tweets/${tweetID}?tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld`
  try {
    const rawResult = await (await fetch(url, requestOptions)).text()
    const result = JSON.parse(rawResult)
    console.log({ result, headers })
    const value = [
      [ _.first(result?.data?.entities?.urls)?.expanded_url, result?.data?.text, result?.data?.created_at, result?.data?.author_id ],
    ]
    res.send(JSON.stringify({ value }));
  } catch(err) {
    console.error('error', err)
  }
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})