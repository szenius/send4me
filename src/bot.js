require("dotenv").config();
require("dotenv").config();
const Telegraf = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN || "";

let bot = null;

const launch = () => {
  bot = new Telegraf(BOT_TOKEN, { polling: true });

  bot.action(new RegExp(/__OPTION__ID__[0-9]+__/), ctx => {
    // TODO: add response to DB
    console.log('action triggered: ');
    ctx.answerCbQuery(`You responded!`, true);
  });

  bot.launch();
};

const getBot = () => {
  if (bot) {
    return bot;
  }
  throw new Error("Bot not initialised!");
};

module.exports = {
  launch,
  getBot
};
