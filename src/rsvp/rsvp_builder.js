const buildNewRsvpString = (eventName, dateString) => {
  return buildRsvpString(eventName, dateString, [], []);
};

const buildRsvpString = (eventName, dateString, coming, notComing) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\ncoming:\n${generateUserString(
    coming
  )}\nnot coming(reason):\n${generateUserString(notComing)}`;
};

const addDisabledRsvpHeader = (rsvpString) => {
  return '*RSVP HAS CLOSED.*\n\n' + rsvpString;
};

const generateUserString = users => {
  userString = "";
  for (const user of users) {
    userString += user.first_name + "\n";
  }
  return userString;
};

module.exports = {
  buildNewRsvpString,
  buildRsvpString,
  addDisabledRsvpHeader,
};
