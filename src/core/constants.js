const ACTION_COMING = "coming";
const ACTION_NOT_COMING_WORK_SCHOOL = "not_coming_work_school";
const ACTION_NOT_COMING_SICK = "not_coming_sick";
const ACTION_NOT_COMING_OTHERS = "not_coming_others";

const TEXT_NOT_COMING = "not coming";
const TEXT_REASON_WORK_SCHOOL = "(work/school)";
const TEXT_REASON_SICK = "(sick)";
const TEXT_REASON_OTHERS = "(others)";

const FILENAME_ACTIVE_RSVP = "active_rsvp.json";
const FILENAME_SCHEDULE = "schedule.json";

const getMenuButtonText = action => {
  switch (action) {
    case ACTION_COMING:
      return ACTION_COMING;
    case ACTION_NOT_COMING_WORK_SCHOOL:
      return `${TEXT_NOT_COMING} ${TEXT_REASON_WORK_SCHOOL}`;
    case ACTION_NOT_COMING_SICK:
      return `${TEXT_NOT_COMING} ${TEXT_REASON_SICK}`;
    case ACTION_NOT_COMING_OTHERS:
      return `${TEXT_NOT_COMING} ${TEXT_REASON_OTHERS}`;
    default:
      console.error(`No such action found: ${action}`);
      return "";
  }
};

module.exports = {
  ACTION_COMING,
  ACTION_NOT_COMING_WORK_SCHOOL,
  ACTION_NOT_COMING_SICK,
  ACTION_NOT_COMING_OTHERS,
  TEXT_REASON_WORK_SCHOOL,
  TEXT_REASON_SICK,
  TEXT_REASON_OTHERS,
  FILENAME_ACTIVE_RSVP,
  FILENAME_SCHEDULE,
  getMenuButtonText
};
