const Telegraf = require('telegraf');
const {savedDate, inSchedule} = require('./utils/DateUtils.js');
const {standardiseText} = require('./utils/TextUtils.js');
const {markComing, markNotComing} = require('./RequestHandler.js');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = []; // TODO: save to database

bot.command('coming', ctx => {
  markComing(ctx.from.id);
}); 

bot.command('notcoming', ctx => {
  const message = standardiseText(ctx.message.text);
  const match = message.match(/\/notcoming (.*)/);
  if (match === null) {
    ctx.reply(`Please help to fill in a reason by doing "/notcoming [reason]"`);
  } else {
    markNotComing(ctx.from.id, match[1]);
  }
});

bot.launch();

while (sentDates.length === 0) { // TODO: use infinite loop with timeout
  let today = new Date();
  if (inSchedule(today) && !savedDate(today, sentDates)) {
    console.log("Sending message...");
    bot.telegram.sendMessage(process.env.CHAT_ID, "Hello").catch(console.error);
    sentDates.push(today);
  }
}