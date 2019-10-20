const { Poll } = require("../models/poll");
const moment = require("moment");

/**
 * Builds a poll for the default weekly sessions.
 * The poll is set to be sent out 3 days before the session date, and will close on the session date.
 *
 * @param {string} sessionName
 * @param {Date} sessionDate
 */
const buildSessionPoll = (sessionName, sessionDate) => {
  return new Poll(
    `Hi volunteers, the next ${sessionName} will be on ${sessionDate.format(
      "dddd, MMM Do, h:mm A"
    )}. Please indicate your attendance below!`,
    moment(sessionDate).subtract(3, "day"),
    sessionDate,
    ["coming", "not coming(reason)"]
  );
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
  buildSessionPoll
};
