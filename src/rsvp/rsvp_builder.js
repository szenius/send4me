const buildNewRsvpString = (eventName, dateString) => {
  return buildRsvpString(eventName, dateString, new Map(), new Map());
};

const buildRsvpString = (eventName, dateString, coming, notComing) => {
  let rsvpString = `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\n`;
  rsvpString += `coming:\n${generateUserStringFromMap(coming)}\n`;
  rsvpString += `not coming(reason):\n${generateUserStringFromMap(notComing)}\n`;
  return rsvpString;
};

const buildDisabledRsvpString = (eventName, dateString, coming, notComing) => {
  let rsvpString = `*RSVP HAS CLOSED.*\n\n`;
  rsvpString += `${buildRsvpString(eventName, dateString, coming, notComing)}`
  return rsvpString;
};

const generateUserStringFromMap = map => {
  let userString = "";
  map.forEach((value) => {
    userString += `${value.first_name}${value.reason || ""}\n`;
  });
  return userString;
};

module.exports = {
  buildNewRsvpString,
  buildRsvpString,
  buildDisabledRsvpString
};
