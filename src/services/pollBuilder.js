const { Poll } = require("../models/poll");
const { getOptionsForMessage } = require("./database");
const { getBot } = require("../bot");
const { Extra } = require("Telegraf");
const moment = require("moment");

/**
 * Builds a poll for the default weekly sessions.
 * The poll is set to be sent out 3 days before the session date, and will close on the session date.
 *
 * @param {string} sessionName
 * @param {Date} sessionDate
 * @param {string} chatId
 */
const buildSessionPoll = (sessionName, sessionDate, chatId) => {
  return new Poll(
    `Hi volunteers, the next ${sessionName} will be on ${sessionDate.format(
      "dddd, MMM Do, h:mm A"
    )}. Please indicate your attendance below!`,
    moment(sessionDate).subtract(3, "day"),
    sessionDate,
    chatId,
    ["coming", "not coming"]
  );
};

const getInlineKeyboard = (poll, callback) => {
  getOptionsForMessage(poll.message_id, poll.chat_id, (err, options) => {
    const inlineKeyboard = Extra.markdown().markup(m =>
      m.inlineKeyboard(
        options.map(option => {
          console.log("id: ", `__OPTION__ID__${option.id}__`, "|| text: ", option.text);
          return m.callbackButton(option.text, `__OPTION__ID__${option.id}__`);
        }),
        { columns: 1 }
      )
    );
    callback(err, inlineKeyboard);
  });
};

// const buildNewRsvpString = (eventName, dateString) => {
//   return buildRsvpString(eventName, dateString, new Map(), new Map());
// };

// const buildRsvpString = (eventName, dateString, coming, notComing) => {
//   let rsvpString = `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\n`;
//   rsvpString += `coming:\n${generateUserStringFromMap(coming)}\n`;
//   rsvpString += `not coming(reason):\n${generateUserStringFromMap(
//     notComing
//   )}\n`;
//   return rsvpString;
// };

// const buildDisabledRsvpString = (eventName, dateString, coming, notComing) => {
//   let rsvpString = `*RSVP HAS CLOSED.*\n\n`;
//   rsvpString += `${buildRsvpString(eventName, dateString, coming, notComing)}`;
//   return rsvpString;
// };

// const generateUserStringFromMap = map => {
//   let userString = "";
//   map.forEach(value => {
//     userString += `${value.first_name}${value.reason || ""}\n`;
//   });
//   return userString;
// };

module.exports = {
  buildSessionPoll,
  getInlineKeyboard
};
