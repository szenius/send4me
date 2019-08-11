const buildRsvp = (eventName, dateString) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\ncoming:\n\nnot coming(reason):`;
};

const updateRsvpString = (eventName, dateString, coming, notComing) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\ncoming:\n${generateUserString(
    coming
  )}\nnot coming(reason):\n${generateUserString(notComing)}`;
};

const generateUserString = users => {
  userString = "";
  for (const user of users) {
    userString += user.first_name + "\n";
  }
  return userString;
};

module.exports = {
  buildRsvp,
  updateRsvpString
};
