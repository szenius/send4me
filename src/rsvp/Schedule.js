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
    date: new Date("August 13 2019 01:18"),
    eventName: "reading session",
    dateString: "this Friday 16 August 8PM"
  },
  {
    date: new Date("August 13 2019 01:20"),
    eventName: "art session",
    dateString: "this Friday 16 August 9PM"
  }
];

module.exports = {
  getEvent
};
