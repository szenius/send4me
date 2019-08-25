require("dotenv").config();

const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const Promise = require("bluebird");

const { foundDateInArray, isSameDate } = require("./utils/date_utils.js");
const { getEvent } = require("rsvp/schedule.js");
const {
  ACTION_COMING,
  ACTION_NOT_COMING,
  MENU_BUTTON_TEXT_COMING,
  MENU_BUTTON_TEXT_NOT_COMING
} = require("./constants/constants.js");
const {
  buildNewRsvpString,
  buildRsvpString,
  buildDisabledRsvpString
} = require("./rsvp/rsvp_builder.js");
const {
  foundObjectInArray,
  removeObjectFromArray
} = require("./utils/array_utils.js");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });

let activeRsvp = null;
const sentDates = [];

/**
 * Inline menu for Default RSVPs
 */
const defaultRsvpMenu = Markup.inlineKeyboard([
  Markup.callbackButton(MENU_BUTTON_TEXT_COMING, ACTION_COMING),
  Markup.callbackButton(MENU_BUTTON_TEXT_NOT_COMING, ACTION_NOT_COMING)
]).extra();

/**
 * Steps to be executed when user clicks on "coming" button on RSVP.
 */
bot.action(ACTION_COMING, ctx => {
  // If there is no active RSVP, do nothing.
  if (!activeRsvp) {
    console.log("No active RSVP is present. Perhaps the bot crashed?");
    return;
  }

  // Check if coming and notcoming arrays are present in activeRSVP. If not, set to empty arrays.
  activeRsvp.coming = activeRsvp.coming ? activeRsvp.coming : [];
  activeRsvp.notComing = activeRsvp.notComing ? activeRsvp.notComing : [];

  // If user tries to RSVP for old event (not the current active one), do nothing.
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) is trying to RSVP for an old event!`
    );
    return;
  }
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is coming`);

  // If user has already said they will come, do nothing.
  if (foundObjectInArray(ctx.from, activeRsvp.coming)) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) already said they are coming`
    );
    return;
  }

  // Mark user as coming.
  removeObjectFromArray(ctx.from, activeRsvp.notComing);
  activeRsvp.coming.push(ctx.from);
  updateRsvpMessage(ctx);
});

bot.action(ACTION_NOT_COMING, ctx => {
  // If there is no active RSVP, do nothing.
  if (!activeRsvp) {
    console.log("No active RSVP is present. Perhaps the bot crashed?");
    return;
  }

  // Check if coming and notcoming arrays are present in activeRSVP. If not, set to empty arrays.
  activeRsvp.coming = activeRsvp.coming ? activeRsvp.coming : [];
  activeRsvp.notComing = activeRsvp.notComing ? activeRsvp.notComing : [];

  // If user tries to RSVP for old event (not the current active one), do nothing.
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) is trying to RSVP for an old event!`
    );
    return;
  }
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is not coming`);

  // If user has already said they will not come, do nothing.
  if (foundObjectInArray(ctx.from, activeRsvp.notComing)) {
    console.log(
      `${ctx.from.first_name} (${
        ctx.from.username
      }) already said they are coming`
    );
    return;
  }

  // Mark user as not coming.
  removeObjectFromArray(ctx.from, activeRsvp.coming);
  activeRsvp.notComing.push(ctx.from);
  updateRsvpMessage(ctx);
});

/**
 * Disable old RSVPs by removing the inline menu for these old messages.
 * This is necessary for our current assumption that there can only be one active RSVP at any point in time.
 */
const disableOldRsvp = () => {
  bot.telegram.editMessageText(
    process.env.CHAT_ID,
    activeRsvp.messageId,
    activeRsvp.messageId,
    buildDisabledRsvpString(
      activeRsvp.eventName,
      activeRsvp.dateString,
      activeRsvp.coming,
      activeRsvp.notComing
    ),
    Extra.markdown()
  );
  activeRsvp = null;
};

/**
 * Update message for active RSVP.
 * @param {*} ctx
 */
const updateRsvpMessage = ctx => {
  ctx.editMessageText(
    buildRsvpString(
      activeRsvp.eventName,
      activeRsvp.dateString,
      activeRsvp.coming,
      activeRsvp.notComing
    ),
    defaultRsvpMenu
  );
};

/**
 * Infinite loop that runs with a fixed delay between iterations.
 * In each iteration, check if it is time to send out a scheduled event or disable an active RSVP.
 */
const run = () => {
  console.log("Checking if should send message...");
  const now = new Date();
  const scheduledEvent = getEvent(now);
  if (scheduledEvent && !foundDateInArray(scheduledEvent.date, sentDates)) {
    // Reset active RSVP
    if (activeRsvp) {
      disableOldRsvp();
    }
    activeRsvp = {
      ...scheduledEvent,
      coming: [],
      notComing: []
    };
    // Send out new RSVP
    console.log("Sending message...");
    const message = buildNewRsvpString(
      scheduledEvent.eventName,
      scheduledEvent.dateString
    );
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
