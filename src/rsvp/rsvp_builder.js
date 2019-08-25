const buildNewRsvpString = (eventName, dateString) => {
  return buildRsvpString(eventName, dateString, [], []);
};

const buildRsvpString = (eventName, dateString, coming, notComing) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!
  
  coming:
  ${generateUserString(coming)}
  not coming(reason):
  ${generateUserString(notComing)}`;
};

const buildDisabledRsvpString = (eventName, dateString, coming, notComing) => {
  return `*RSVP HAS CLOSED.*
  
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
  buildDisabledRsvpString
};
