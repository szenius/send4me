require("dotenv").config();
const Telegraf = require("telegraf");
const { savedDate, inSchedule } = require("./utils/DateUtils.js");
const { standardiseText } = require("./utils/TextUtils.js");
const { markComing, markNotComing } = require("./RequestHandler.js");
const {
  COMMAND_COMING,
  COMMAND_NOTCOMING,
  EXPECTED_NOTCOMING_PATTERN
} = require("./constants/Commands.js");
const Promise = require("bluebird");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = []; // TODO: save to database

bot.command(COMMAND_COMING, ctx => {
  markComing(ctx.from.id);
});

bot.command(COMMAND_NOTCOMING, ctx => {
  const message = standardiseText(ctx.message.text);
  const match = message.match(EXPECTED_NOTCOMING_PATTERN);
  if (match === null) {
    ctx.reply(`Please help to fill in a reason by doing "/notcoming [reason]"`);
  } else {
    markNotComing(ctx.from.id, match[1]);
  }
});

const run = () => {
  const today = new Date();
  console.log("Checking if should send message...");
  if (inSchedule(today) && !savedDate(today, sentDates)) {
    console.log("Sending message...");
    bot.telegram.sendMessage(process.env.CHAT_ID, "Hello World");
    console.log("Sent message");
    sentDates.push(today);
  }
  return Promise.delay(5000).then(() => run());
};

bot.launch();
run();
