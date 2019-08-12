require("dotenv").config();
const Telegraf = require("telegraf");
const { Markup } = Telegraf;
const Promise = require("bluebird");
const { savedDate, inSchedule } = require("./utils/DateUtils.js");
const { ACTION_COMING, ACTION_NOTCOMING } = require("./constants/Actions.js");
const {
  buildNewRsvpString,
  buildRsvpString
} = require("./rsvp/DefaultRsvpBuilder.js");
const _ = require("lodash");
const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = []; // TODO: save to database
const coming = [];
const notComing = [];
const eventName = "reading session";
const dateString = "Friday, 23 Aug 7.50PM";

bot.action(ACTION_COMING, ctx => {
  console.log(`${ctx.from.first_name} is coming`);

  if (alreadyComing(ctx.from)) {
    console.log(`${ctx.from.first_name} already said they are coming`);
    return;
  } else {
    const matches = removeFromNotComing(ctx.from);
    if (matches === undefined || matches.length === 0) {
      coming.push(ctx.from);
      ctx.editMessageText(
        buildRsvpString(eventName, dateString, coming, notComing),
        defaultRsvpMenu
      );    
    }
  }
});

const alreadyComing = from => {
  return _.some(coming, from);
};

const alreadyNotComing = from => {
  return _.some(notComing, from);
}

const removeFromNotComing = from => {
  _.remove(notComing, function(e) {
    return _.isEqual(e, from);
  });
}

const removeFromComing = from => {
  _.remove(coming, function(e) {
    return _.isEqual(e, from);
  });
}

bot.action(ACTION_NOTCOMING, ctx => {
  console.log(`${ctx.from.first_name} is not coming`);

  if (alreadyNotComing(ctx.from)) {
    console.log(`${ctx.from.first_name} already said they are coming`);
  } else {
    const matches = removeFromComing(ctx.from);
    if (matches === undefined || matches.length === 0) {
      notComing.push(ctx.from);
      ctx.editMessageText(
        buildRsvpString(eventName, dateString, coming, notComing),
        defaultRsvpMenu
      );
    }
  }
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
    const message = buildNewRsvpString(eventName, dateString); // TODO: read from schedule
    bot.telegram.sendMessage(process.env.CHAT_ID, message, defaultRsvpMenu);
    console.log("Sent message");
    sentDates.push(today);
  }
  return Promise.delay(5000).then(() => run()); // TODO: increase delay
};

bot.launch();
run();
