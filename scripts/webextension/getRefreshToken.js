/* eslint-disable import/no-dynamic-require, camelcase */
const request = require('request');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// GET AUTH_CODE:
// https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/chromewebstore&response_type=code&access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob&client_id=473593894380-6s0kab3e7qjc7c1c4rlq0qffcnj8bu2i.apps.googleusercontent.com

const form = {
  client_id: process.env.GAPI_MOBX_EXTENSION_CLIENT_ID,
  client_secret: process.env.GAPI_MOBX_EXTENSION_CLIENT_SECRET,
  code: process.env.GAPI_MOBX_EXTENSION_CLIENT_AUTH_CODE, // <- put AUTH_CODE here
  grant_type: 'authorization_code',
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
};

request({
  url: `https://accounts.google.com/o/oauth2/token`,
  method: 'POST',
  form,
}, (err, response, body) => {
  if (err) {
    throw err;
  }
  const {error, refresh_token, access_token, expires_in, token_type} = JSON.parse(body);
  if (error) {
    throw error;
  }
  console.log({error, refresh_token, access_token, expires_in, token_type})
});
