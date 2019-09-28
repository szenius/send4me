const getNextEvent = (schedule, now) =>
  schedule
    .filter(event => !event.isSent)
    .find(event => isSameDate(event.date, now));

const isSameDate = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
};

module.exports = {
  getNextEvent,
  isSameDate
};
