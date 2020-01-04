require("dotenv").config();
const Telegraf = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN || "";

let bot = null;

const initBot = () => {
  bot = new Telegraf(BOT_TOKEN, { polling: true });
};

const launchBot = () => {
  bot.launch();
  isLaunched = true;
};

const getBot = () => {
  if (bot) {
    return bot;
  }
  throw new Error("Bot not initialised!");
};

module.exports = {
  initBot,
  launchBot,
  getBot
};
