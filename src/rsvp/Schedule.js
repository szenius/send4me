const { isSameDate } = require("../utils/DateUtils.js");

const getEvent = date => {
  for (const scheduledEvent of events) {
    if (isSameDate(date, scheduledEvent.date)) {
      return scheduledEvent;
    }
  }
  return null;
};

// TODO: add deadline
const events = [
  {
    date: new Date("August 12 2019 21:57"),
    eventName: "reading session",
    dateString: "this Friday 16 August 8PM"
  },
  {
    date: new Date("August 12 2019 21:59"),
    eventName: "art session",
    dateString: "this Friday 16 August 9PM"
  }
];

module.exports = {
  getEvent
};
