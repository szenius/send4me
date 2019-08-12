require("dotenv").config();

const Telegraf = require("telegraf");
const { Markup } = Telegraf;
const Promise = require("bluebird");

const { foundDateInArray } = require("./utils/DateUtils.js");
const { getEvent } = require("./rsvp/Schedule.js");
const {
  ACTION_COMING,
  ACTION_NOTCOMING,
  MENU_BUTTON_TEXT_COMING,
  MENU_BUTTON_TEXT_NOTCOMING
} = require("./constants/Constants.js");
const {
  buildNewRsvpString,
  buildRsvpString
} = require("./rsvp/RsvpBuilder.js");
const {
  foundObjectInArray,
  removeObjectFromArray
} = require("./utils/ArrayUtils.js");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });

let activeRsvp = null;
const sentDates = [];

const defaultRsvpMenu = Markup.inlineKeyboard([
  Markup.callbackButton(MENU_BUTTON_TEXT_COMING, ACTION_COMING),
  Markup.callbackButton(MENU_BUTTON_TEXT_NOTCOMING, ACTION_NOTCOMING)
]).extra();

bot.action(ACTION_COMING, ctx => {
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) is trying to RSVP for an old event!`
    );
    return;
  }
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is coming`);
  if (foundObjectInArray(ctx.from, activeRsvp.coming)) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) already said they are coming`
    );
    return;
  } else {
    const matches = removeObjectFromArray(ctx.from, activeRsvp.notComing);
    if (matches === undefined || matches.length === 0) {
      activeRsvp.coming.push(ctx.from);
      ctx.editMessageText(
        buildRsvpString(
          activeRsvp.eventName,
          activeRsvp.dateString,
          activeRsvp.coming,
          activeRsvp.notComing
        ),
        defaultRsvpMenu
      );
    }
  }
});

bot.action(ACTION_NOTCOMING, ctx => {
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) is trying to RSVP for an old event!`
    );
    return;
  }
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is not coming`);
  if (foundObjectInArray(ctx.from, activeRsvp.notComing)) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) already said they are coming`
    );
  } else {
    const matches = removeObjectFromArray(ctx.from, activeRsvp.coming);
    if (matches === undefined || matches.length === 0) {
      activeRsvp.notComing.push(ctx.from);
      ctx.editMessageText(
        buildRsvpString(
          activeRsvp.eventName,
          activeRsvp.dateString,
          activeRsvp.coming,
          activeRsvp.notComing
        ),
        defaultRsvpMenu
      );
    }
  }
});

const run = () => {
  console.log("Checking if should send message...");
  const scheduledEvent = getEvent(new Date());
  if (
    scheduledEvent !== null &&
    !foundDateInArray(scheduledEvent.date, sentDates)
  ) {
    console.log("Sending message...");
    const message = buildNewRsvpString(
      scheduledEvent.eventName,
      scheduledEvent.dateString
    );
    activeRsvp = {
      ...scheduledEvent,
      coming: [],
      notComing: []
    };
    bot.telegram
      .sendMessage(process.env.CHAT_ID, message, defaultRsvpMenu)
      .then(m => {
        bot.telegram.pinChatMessage(process.env.CHAT_ID, m.message_id);
        activeRsvp.messageId = m.message_id;
        console.log(`Sent message with id ${activeRsvp.messageId}`);
      }); // TODO: handle promise rejection
    sentDates.push(activeRsvp.date);
  }
  return Promise.delay(5000).then(() => run()); // TODO: increase delay
};

bot.launch();
run();
