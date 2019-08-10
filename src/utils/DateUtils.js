const savedDate = (newDate, sentDates) => {
  console.log(`new date: ${newDate}`);
  console.log(`savedDates: ${sentDates}`);
  for (const sentDate of sentDates) {
    if (isSameDate(sentDate, newDate)) {
      console.log(`same date! ${sentDate} & ${newDate}`);
      return true;
    }
  }
  return false;
};

const inSchedule = date => {
  return date.getDate() % 2 == 0; // TODO: read from schedule in database
};

const isSameDate = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getYear() === date2.getYear()
  );
};

module.exports = {
  savedDate,
  inSchedule
};
