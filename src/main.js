require('dotenv').config();
const express = require('express');
const expressApp = express();
const {setUpBot} = require('./bot/bot');
const Promise = require('bluebird');
const {ping} = require('./ping/ping');
const {sendNewMessages, closeOldMessages} = require('./scheduler/scheduler');

const PORT = process.env.PORT || 3000;
const APP_URL = process.env.HEROKU_APP_URL || '';
const RUN_INTERVAL = process.env.RUN_INTERVAL || 5000;

/**
 * Set up Express server
 */
expressApp.get('/', (req, res) => {
  res.send('Hello World!');
});
expressApp.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/**
 * Set up Telegram bot
 */
setUpBot();

/**
 * Run all jobs in infinite loop.
 */
const run = () => {
  ping(APP_URL);
  try {
    sendNewMessages();
    closeOldMessages();
  } catch (error) {
    console.error(`Error sending new messages and closing old messages: ${error}`);
  }
  return Promise.delay(RUN_INTERVAL).then(() => run());
};
run();
