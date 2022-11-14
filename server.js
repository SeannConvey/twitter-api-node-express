import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import fetch from 'cross-fetch';
import express from 'express';
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

app.post('/getTweet', async (req, res) => {
  const token = await getToken({ 
    consumer_key: req?.body?.context?.keys?.twitter?.['TWITTER_API_CONSUMER_KEY'],
    consumer_secret: req?.body?.context?.keys?.twitter?.['TWITTER_API_CONSUMER_SECRET'],
  })
  console.log({ token })
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

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})