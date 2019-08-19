const { isSameDate } = require("../utils/date_utils.js/index.js");

// Assumes that events are of unique dates
const getEvent = date => {
  return events.find(event => {
    isSameDate(date, event.date);
  });
};

const events = [
  {
    date: new Date("August 20 2019 10:00"),
    eventName: "reading session",
    dateString: "this Friday 23 August 7.50PM",
    deadline: new Date("August 23 2019 20:00")
  },
  {
    date: new Date("August 27 2019 10:00"),
    eventName: "reading session",
    dateString: "this Friday 30 August 7.50PM",
    deadline: new Date("August 30 2019 20:00")
  },
  {
    date: new Date("September 3 2019 10:00"),
    eventName: "reading session",
    dateString: "this Friday 6 Sept 7.50PM",
    deadline: new Date("September 6 2019 20:00")
  },
  {
    date: new Date("September 17 2019 10:00"),
    eventName: "recap session",
    dateString: "this Friday 20 Sept 7.50PM",
    deadline: new Date("September 20 2019 20:00")
  },
  {
    date: new Date("October 8 2019 10:00"),
    eventName: "recap session",
    dateString: "this Friday 11 Oct 7.50PM",
    deadline: new Date("October 11 2019 20:00")
  }
];

module.exports = {
  getEvent
};
