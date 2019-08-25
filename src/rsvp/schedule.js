const { isSameDate } = require("../utils/date_utils.js");

// Assumes that events are of unique dates
const getEvent = date => {
  return events.find(event => isSameDate(date, event.date));
};

// TODO: Populate with actual schedule
// TODO: Migrate to database
const events = [
  {
    date: new Date("August 25 2019 23:35"),
    eventName: "test event",
    dateString: "test date",
    deadline: new Date("August 25 2019 23:45")
  },
  {
    date: new Date("August 26 2019 10:00"),
    eventName: "test event 2",
    dateString: "test date 2",
    deadline: new Date("August 26 2019 10:30")
  },
  {
    date: new Date("August 26 2019 11:00"),
    eventName: "test event 3",
    dateString: "test date 3",
    deadline: new Date("August 29 2019 12:00")
  },
  {
    date: new Date("August 26 2019 15:00"),
    eventName: "test event 4",
    dateString: "test date 4",
    deadline: new Date("August 26 2019 16:00")
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
