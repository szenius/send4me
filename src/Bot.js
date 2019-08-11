require("dotenv").config();
const Telegraf = require("telegraf");
const { Markup } = Telegraf;
const Promise = require("bluebird");
const { savedDate, inSchedule } = require("./utils/DateUtils.js");
const { ACTION_COMING, ACTION_NOTCOMING } = require("./constants/Actions.js");
const { buildRsvp, updateRsvpString } = require("./rsvp/DefaultRsvpBuilder.js");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = []; // TODO: save to database
const coming = [];
const notComing = [];
const eventName = "reading session";
const dateString = "Friday, 23 Aug 7.50PM";

bot.action(ACTION_COMING, ctx => {
  console.log(`${ctx.from.id} is coming`);
  coming.push(ctx.from);
  ctx.editMessageText(updateRsvpString(eventName, dateString, coming, notComing), defaultRsvpMenu);
});

bot.action(ACTION_NOTCOMING, ctx => {
  console.log(`${ctx.from.id} is not coming`);
  notComing.push(ctx.from);
  ctx.editMessageText(updateRsvpString(eventName, dateString, coming, notComing), defaultRsvpMenu);
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
    const message = buildRsvp(eventName, dateString); // TODO: read from schedule
    bot.telegram.sendMessage(process.env.CHAT_ID, message, defaultRsvpMenu);
    console.log("Sent message");
    sentDates.push(today);
  }
  return Promise.delay(5000).then(() => run());
};

bot.launch();
run();
