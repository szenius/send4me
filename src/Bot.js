require("dotenv").config();
const Telegraf = require("telegraf");
const { Markup } = Telegraf;
const Promise = require("bluebird");
const { savedDate, inSchedule } = require("./utils/DateUtils.js");
const { markComing, markNotComing } = require("./RequestHandler.js");
const {
  ACTION_COMING,
  ACTION_NOTCOMING
} = require("./constants/Actions.js");
const { buildRsvp } = require("./rsvp/DefaultRsvpBuilder.js");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = []; // TODO: save to database

bot.action(ACTION_COMING, ctx => {
  markComing(ctx.from.id);
  ctx.reply("wuhu");
});

bot.action(ACTION_NOTCOMING, ctx => {
  markNotComing(ctx.from.id); // TODO:
  ctx.reply("no why");
});

const defaultRsvpMenu = Markup.inlineKeyboard([
  Markup.callbackButton("coming", ACTION_COMING),
  Markup.callbackButton("not coming", ACTION_NOTCOMING)
]).extra();

const run = () => {
  const today = new Date();
  console.log("Checking if should send message...");
  if (inSchedule(today) && !savedDate(today, sentDates)) {
    console.log("Sending message...");
    const message = buildRsvp("reading session", "Friday, 23 Aug 7.50PM"); // TODO: read from schedule
    bot.telegram.sendMessage(process.env.CHAT_ID, message, defaultRsvpMenu);
    console.log("Sent message");
    sentDates.push(today);
  }
  return Promise.delay(5000).then(() => run());
};

bot.launch();
run();
