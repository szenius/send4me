require("dotenv").config();

const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const Promise = require("bluebird");

const { foundDateInArray, isSameDate } = require("./utils/date_utils.js");
const { getEvent } = require("./rsvp/schedule.js");
const {
  ACTION_COMING,
  ACTION_NOT_COMING,
  MENU_BUTTON_TEXT_COMING,
  MENU_BUTTON_TEXT_NOT_COMING
} = require("./constants/constants.js");
const {
  buildNewRsvpString,
  buildRsvpString,
  addDisabledRsvpHeader
} = require("./rsvp/rsvp_builder.js");
const {
  foundObjectInArray,
  removeObjectFromArray
} = require("./utils/array_utils.js");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });

let activeRsvp = null;
const sentDates = [];

const defaultRsvpMenu = Markup.inlineKeyboard([
  Markup.callbackButton(MENU_BUTTON_TEXT_COMING, ACTION_COMING),
  Markup.callbackButton(MENU_BUTTON_TEXT_NOT_COMING, ACTION_NOT_COMING)
]).extra();

bot.action(ACTION_COMING, ctx => {
  if (!activeRsvp) {
    console.log('No active RSVP is present. Perhaps the bot crashed?');
    return;
  }
  activeRsvp.coming = activeRsvp.coming ? activeRsvp.coming : [];
  activeRsvp.notComing = activeRsvp.notComing ? activeRsvp.notComing : [];
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
  } else {
    removeObjectFromArray(ctx.from, activeRsvp.notComing);
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
});

bot.action(ACTION_NOT_COMING, ctx => {
  if (!activeRsvp) {
    console.log('No active RSVP is present. Perhaps the bot crashed?');
    return;
  }
  activeRsvp.coming = activeRsvp.coming ? activeRsvp.coming : [];
  activeRsvp.notComing = activeRsvp.notComing ? activeRsvp.notComing : [];
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) is trying to RSVP for an old event!`
    );
  }
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is not coming`);
  if (foundObjectInArray(ctx.from, activeRsvp.notComing)) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) already said they are coming`
    );
  } else {
    removeObjectFromArray(ctx.from, activeRsvp.coming);
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
});

const disableOldRsvp = () => {
  bot.telegram.editMessageText(
    process.env.CHAT_ID,
    activeRsvp.messageId,
    activeRsvp.messageId,
    addDisabledRsvpHeader(
      buildRsvpString(
        activeRsvp.eventName,
        activeRsvp.dateString,
        activeRsvp.coming,
        activeRsvp.notComing
      )
    ),
    Extra.markdown()
  );
  activeRsvp = null;
};

const run = () => {
  console.log("Checking if should send message...");
  const now = new Date();
  const scheduledEvent = getEvent(now);
  if (scheduledEvent && !foundDateInArray(scheduledEvent.date, sentDates)) {
    if (activeRsvp) {
      disableOldRsvp();
    }
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
  console.log("Checking if should disable old RSVPs...");
  if (activeRsvp && isSameDate(activeRsvp.deadline, now)) {
    disableOldRsvp();
  }
  return Promise.delay(5000).then(() => run()); // TODO: increase delay
};

bot.launch();
run();
