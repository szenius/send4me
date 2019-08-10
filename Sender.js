const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = [];

const isSameDate = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getYear() === date2.getYear()
  );
};

const savedDate = newDate => {
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
  return date.getDate() % 2 == 0;
};

while (sentDates.length === 0) {
  let today = new Date();
  if (inSchedule(today) && !savedDate(today)) {
    console.log("Sending message...");
    bot.telegram.sendMessage('-1001205975376', "Hello").catch(console.error);
    sentDates.push(today);
  }
}
