const { isSameDate } = require("../utils/date_utils.js");

const DEFAULT_OPTIONS = [
  { title: "coming", actionId: "coming" },
  { title: "not coming (work/school)", actionId: "not_coming_work_school" },
  { title: "not coming (social)", actionId: "not_coming_social" },
  { title: "not coming (sick)", actionId: "not_coming_sick" },
  { title: "not coming (others)", actionId: "not_coming_others" }
];

// Assumes that events are of unique dates
const getEvent = date => {
  return events.find(event => isSameDate(date, event.date));
};

// TODO: Populate with actual schedule
// TODO: Migrate to database
const events = [
  {
    date: new Date("August 26 2019 10:00 GMT+08:00"),
    eventName: "test event 2",
    dateString: "test date 2",
    deadline: new Date("August 26 2019 10:30 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("August 26 2019 11:00 GMT+08:00"),
    eventName: "test event 3",
    dateString: "test date 3",
    deadline: new Date("August 29 2019 12:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("August 26 2019 15:00 GMT+08:00"),
    eventName: "test event 4",
    dateString: "test date 4",
    deadline: new Date("August 26 2019 16:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("August 27 2019 10:00 GMT+08:00"),
    eventName: "reading session",
    dateString: "this Friday 30 August 7.50PM",
    deadline: new Date("August 30 2019 20:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("September 3 2019 10:00 GMT+08:00"),
    eventName: "reading session",
    dateString: "this Friday 6 Sept 7.50PM",
    deadline: new Date("September 6 2019 20:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("September 17 2019 10:00 GMT+08:00"),
    eventName: "recap session",
    dateString: "this Friday 20 Sept 7.50PM",
    deadline: new Date("September 20 2019 20:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  },
  {
    date: new Date("October 8 2019 10:00 GMT+08:00"),
    eventName: "recap session",
    dateString: "this Friday 11 Oct 7.50PM",
    deadline: new Date("October 11 2019 20:00 GMT+08:00"),
    options: DEFAULT_OPTIONS
  }
];

module.exports = {
  getEvent
};
