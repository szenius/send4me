const Telegraf = require('telegraf');
const {savedDate, inSchedule} = require('./DateUtils.js');

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = [];

while (sentDates.length === 0) { // TODO: use infinite loop with timeout
  let today = new Date();
  if (inSchedule(today) && !savedDate(today, sentDates)) {
    console.log("Sending message...");
    bot.telegram.sendMessage('-1001205975376', "Hello").catch(console.error);
    sentDates.push(today);
  }
}