const { isSameDate } = require("../utils/DateUtils.js");

const getEvent = date => {
  for (const scheduledEvent of events) {
    if (isSameDate(date, scheduledEvent.date)) {
      return scheduledEvent;
    }
  }
  return null;
};

const events = [
  {
    date: new Date("August 13 2019 22:42"),
    eventName: "reading session",
    dateString: "this Friday 16 August 8PM",
    deadline: new Date("August 13 2019 22:43")
  },
  {
    date: new Date("August 13 2019 22:44"),
    eventName: "art session",
    dateString: "this Friday 16 August 9PM",
    deadline: new Date("August 13 2019 22:45")
  }
];

module.exports = {
  getEvent
};
