const buildNewRsvpString = (eventName, dateString) => {
  return buildRsvpString(eventName, dateString, [], []);
};

const buildRsvpString = (eventName, dateString, coming, notComing) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n
  \n
  coming:\n
  ${generateUserString(coming)}\n
  not coming(reason):\n
  ${generateUserString(notComing)}`;
};

const buildDisabledRsvpString = (eventName, dateString, coming, notComing) => {
  return `*RSVP HAS CLOSED.*\n
  \n
  ${buildRsvpString(eventName, dateString, coming, notComing)}`;
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
  buildDisabledRsvpString
};
