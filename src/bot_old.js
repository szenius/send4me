require("dotenv").config();

const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const Promise = require("bluebird");
const https = require("https");

const { getNextEvent, isSameDate } = require("./services/schedule");
const {
  buildNewRsvpString,
  buildRsvpString,
  buildDisabledRsvpString
} = require("./services/pollBuilder");
const {
  readActiveRsvpFromFile,
  readScheduleFromFile,
  writeActiveRsvpToFile,
  writeJsonToFile
} = require("./services/db");
const {
  ACTION_COMING,
  ACTION_NOT_COMING_WORK_SCHOOL,
  ACTION_NOT_COMING_SICK,
  ACTION_NOT_COMING_OTHERS,
  COMMAND_CHAT_ID,
  TEXT_REASON_WORK_SCHOOL,
  TEXT_REASON_SICK,
  TEXT_REASON_OTHERS,
  FILENAME_ACTIVE_RSVP,
  FILENAME_SCHEDULE,
  getMenuButtonText
} = require("./services/constants");
const express = require("express");
const expressApp = express();

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });

let activeRsvp = readActiveRsvpFromFile(FILENAME_ACTIVE_RSVP);
const schedule = readScheduleFromFile(FILENAME_SCHEDULE);

/**
 * Check if coming and notcoming maps are present in activeRSVP. If not, set to empty maps.
 */
const initAttendanceMapsIfNotExist = () => {
  activeRsvp.coming = activeRsvp.coming || new Map();
  activeRsvp.notComing = activeRsvp.notComing || new Map();
};

/**
 * Inline menu for Default RSVPs
 */
const defaultRsvpMenu = Markup.inlineKeyboard(
  [
    Markup.callbackButton(getMenuButtonText(ACTION_COMING), ACTION_COMING),
    Markup.callbackButton(
      getMenuButtonText(ACTION_NOT_COMING_WORK_SCHOOL),
      ACTION_NOT_COMING_WORK_SCHOOL
    ),
    Markup.callbackButton(
      getMenuButtonText(ACTION_NOT_COMING_SICK),
      ACTION_NOT_COMING_SICK
    ),
    Markup.callbackButton(
      getMenuButtonText(ACTION_NOT_COMING_OTHERS),
      ACTION_NOT_COMING_OTHERS
    )
  ],
  { columns: 1 }
).extra();

bot.command(COMMAND_CHAT_ID, ctx => {
  console.log(`Requested chat id: ${ctx.chat.id}`);
  bot.telegram
  .sendMessage(ctx.chat.id, 'Logged Chat ID.')
  .catch(err => console.error(err));
});

/**
 * Steps to be executed when user clicks on "coming" button on RSVP.
 */
bot.action(ACTION_COMING, ctx => {
  // If there is no active RSVP, do nothing.
  if (!activeRsvp) {
    console.log("No active RSVP is present. Perhaps the bot crashed?");
    return;
  }

  initAttendanceMapsIfNotExist();

  // If user tries to RSVP for old event (not the current active one), do nothing.
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${ctx.from.username}) is trying to RSVP for an old event!`
    );
    return;
  }

  // Mark user as coming.
  console.log(`${ctx.from.first_name} (${ctx.from.username}) is coming`);
  activeRsvp.notComing.delete(ctx.from.id);
  activeRsvp.coming.set(ctx.from.id, ctx.from);
  updateRsvpMessage(ctx);
});

/**
 * Steps to be executed when user clicks on "not coming (work/school)" button on RSVP.
 */
bot.action(ACTION_NOT_COMING_WORK_SCHOOL, ctx => {
  executeNotComingAction(
    ctx,
    ACTION_NOT_COMING_WORK_SCHOOL,
    TEXT_REASON_WORK_SCHOOL
  );
});

/**
 * Steps to be executed when user clicks on "not coming (sick)" button on RSVP.
 */
bot.action(ACTION_NOT_COMING_SICK, ctx => {
  executeNotComingAction(ctx, ACTION_NOT_COMING_SICK, TEXT_REASON_SICK);
});

/**
 * Steps to be executed when user clicks on "not coming (others)" button on RSVP.
 */
bot.action(ACTION_NOT_COMING_OTHERS, ctx => {
  executeNotComingAction(ctx, ACTION_NOT_COMING_OTHERS, TEXT_REASON_OTHERS);
});

/**
 * Steps to be executed when user clicks on any not coming actions on RSVP.
 */
const executeNotComingAction = (ctx, action, reason) => {
  // If there is no active RSVP, do nothing.
  if (!activeRsvp) {
    console.log("No active RSVP is present. Perhaps the bot crashed?");
    return;
  }

  initAttendanceMapsIfNotExist();

  // If user tries to RSVP for old event (not the current active one), do nothing.
  if (ctx.update.callback_query.message.message_id !== activeRsvp.messageId) {
    console.log(
      `${ctx.from.first_name} (${ctx.from.username}) is trying to RSVP for an old event!`
    );
    return;
  }

  // If user has already said they will not come, update the reason.
  console.log(
    `${ctx.from.first_name} (${ctx.from.username}) is not coming (${reason})`
  );
  activeRsvp.coming.delete(ctx.from.id);
  activeRsvp.notComing.delete(ctx.from.id);
  activeRsvp.notComing.set(ctx.from.id, { ...ctx.from, reason });
  updateRsvpMessage(ctx);
};

/**
 * Disable old RSVPs by removing the inline menu for these old messages.
 * This is necessary for our current assumption that there can only be one active RSVP at any point in time.
 */
const disableOldRsvp = () => {
  bot.telegram
    .editMessageText(
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
    )
    .catch(err => console.error(err));
  activeRsvp = null;
  writeJsonToFile({}, FILENAME_ACTIVE_RSVP);
};

/**
 * Update message for active RSVP.
 *
 * @param {*} ctx
 */
const updateRsvpMessage = ctx => {
  ctx
    .editMessageText(
      buildRsvpString(
        activeRsvp.eventName,
        activeRsvp.dateString,
        activeRsvp.coming,
        activeRsvp.notComing
      ),
      defaultRsvpMenu
    )
    .catch(err => console.error(err));
  writeActiveRsvpToFile(activeRsvp, FILENAME_ACTIVE_RSVP);
};

/**
 * Infinite loop that runs with a fixed delay between iterations.
 * In each iteration, check if it is time to send out a scheduled event or disable an active RSVP.
 */
const run = () => {
  // Ping app so it won't sleep
  console.log(`Pinging ${process.env.HEROKU_APP_URL}`);
  https.get(process.env.HEROKU_APP_URL);

  // Send message
  const now = new Date();
  const scheduledEvent = getNextEvent(schedule, now);
  if (scheduledEvent && !scheduledEvent.isSent) {
    if (activeRsvp) {
      console.error("Sorry, only one RSVP can be active at any time.");
      return Promise.delay(process.env.RUN_INTERVAL).then(() => run());
    }
    activeRsvp = {
      ...scheduledEvent,
      coming: new Map(),
      notComing: new Map()
    };
    // Send out new RSVP
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
      })
      .catch(err => console.error(err));
    scheduledEvent.isSent = true;
    activeRsvp.isSent = true;
    writeJsonToFile(schedule, FILENAME_SCHEDULE);
    writeActiveRsvpToFile(activeRsvp, FILENAME_ACTIVE_RSVP);
  }

  // Disable old RSVPs
  if (activeRsvp && isSameDate(activeRsvp.deadline, now)) {
    console.log(`Disabling old RSVP ${activeRsvp.messageId}`);
    disableOldRsvp();
  }
  return Promise.delay(process.env.RUN_INTERVAL).then(() => run());
};

bot.launch();
run();



/**
 * db:
 *  User
 *    *id
 *    username
 *  Message
 *    *id
 *    text
 *    sendDate
 *    closeDate
 *    isPoll
 *    isSent
 *    isClosed
 *    chatId
 *  Response
 *    *userId -> user.id
 *    *optionId -> option.id
 *  Option
 *    *messageId -> message.id
uo * 
 * run:
 *  query db Message table to see if any needs to be sent out
 *    messagesToSend <- SELECT * FROM message WHERE sendDate >= now AND isSent = false;
 *    messagesToSend.forEach((message) =>  {
 *      if message is not poll, just send
 *      else decorate message, then send
 *      UPDATE message SET isSent = true, id = new telegram id WHERE id = old id
 *    })
 *  query db Message table to see if any needs to be closed
 *    messagesToClose <- SELECT * FROM message WHERE closeDate <= now AND isClosed = false;
 *    messagesToClose.forEach((message) => {
 *      update message in telegram by removing inline menu
 *      UPDATE message SET isClosed = true WHERE id = telegram id
 *    })
 *  whenever user clicks on poll option
 *    - is poll active? (check against closeDate)
 *      - yes: record response, save to db
 *          poll <- SELECT * FROM message WHERE id = telegram id;
 *          option <- SELECT * FROM option WHERE messageId = telegram id AND text = button text;
 *          INSERT INTO response VALUES(userId, option.)
 *      - no: disable poll
 */