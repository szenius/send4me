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
    date: new Date("August 13 2019 22:28"),
    eventName: "reading session",
    dateString: "this Friday 16 August 8PM",
    deadline: new Date("August 13 2019 22:29")
  },
  {
    date: new Date("August 13 2019 22:26"),
    eventName: "art session",
    dateString: "this Friday 16 August 9PM",
    deadline: new Date("August 14 2019 22:27")
  }
];

module.exports = {
  getEvent
};
