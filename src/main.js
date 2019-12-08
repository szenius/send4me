require("dotenv").config();
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.HEROKU_APP_URL || "";
const RUN_INTERVAL = process.env.RUN_INTERVAL || 5000;

/**
 * Set up Express server
 */
const express = require("express");
const expressApp = express();
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/**
 * Set up MySQL connection
 */
const { connect } = require("./mysql");
connect();

/**
 * Set up Telegram bot
 */
const { launch } = require("./bot");
launch();

/**
 * Run all jobs in infinite loop.
 */
const Promise = require("bluebird");
const { ping } = require("./services/ping");
const { sendNewMessages, closeOldMessages } = require("./services/messages");
const run = () => {
  ping(APP_URL);
  sendNewMessages();
  closeOldMessages();
  return Promise.delay(RUN_INTERVAL).then(() => run());
};
run();
