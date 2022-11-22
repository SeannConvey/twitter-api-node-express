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

app.post('/getTweetSDK', async (req, res) => {
  const token = req?.body?.context?.keys?.twitter?.TWITTER_BEARER_TOKEN
  const client = new Client(token);
  const response = await client.tweets.findTweetById({
    "tweet.fields": [
        "attachments",
        "created_at",
        "entities",
        "geo_id",
        "in_reply_to_user_id",
        "possibly_sensitive",
        "author_id",
        "referenced_tweets",
        "withheld",
        "id",
        "source",
        "lang",
        "text"
    ],
    // "expansions": [
    //     "author_id",
    //     "edit_history_tweet_ids"
    // ],
    // "media.fields": [
    //     "url"
    // ],
    // "user.fields": [
    //     "url"
    // ]
  });

  console.log({ response })
  return
  const headers = {
    'Bearer': token // || req?.body?.context?.keys?.twitter?.['TWITTER_BEARER_TOKEN'] || process.env.TWITTER_BEARER_TOKEN,
  }
  var requestOptions = { method: 'GET', headers: headers, redirect: 'follow' };
  const tweetID = req.body?.kwArgs?.id
  const url = `https://api.twitter.com/2/tweets/${tweetID}?tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld`
  try {
    const raw = await (await fetch(url, requestOptions)).text()
    const result = JSON.parse(raw)
    console.log({ result, headers })
    const value = [
      [ _.first(result?.data?.entities?.urls)?.expanded_url, result?.data?.text, result?.data?.created_at, result?.data?.author_id ],
    ]
    res.send(JSON.stringify({ value }));
  } catch(err) {
    console.error('error', err)
  }
})

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
    const raw = await fetch(endpoint)
    const value = [
      [ raw.url ]
    ]
    res.send(JSON.stringify({ value }));
  } catch(err) {
    console.error('error', err)
  }
})

app.post('/createNotionPage', async (req, res) => {
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
    const raw = await fetch(endpoint)
    const value = [
      [ raw.url ],
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
    const raw = await (await fetch(url, requestOptions)).text()
    const result = JSON.parse(raw)
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