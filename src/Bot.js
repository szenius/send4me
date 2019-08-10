const Telegraf = require('telegraf');
const {savedDate, inSchedule} = require('./utils/DateUtils.js');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: true });
const sentDates = [];

bot.command('coming', ctx => {
  markComing(ctx.from.id);
}); 

bot.command('notcoming', ctx => {
  if (standardiseText(ctx.message.text) === '/notcoming') {
    ctx.reply(`Please help to fill in a reason by doing "/notcoming [reason]"`);
  } else {
    markNotComing(ctx.from.id, ctx.message.text.match(/\/notcoming (.*)/)[1]);
  }
});

bot.on('message', ctx => {
  console.log(ctx.message);
});

bot.launch();

const markComing = userId => {
  console.log(`${userId} is coming`);
};

const markNotComing = (userId, reason) => {
    console.log(`${userId} is not coming because ${reason}`);
};

const rsvpBuilder = ((name, dateString) => {
  return `Hi volunteers, the next ${name} will be on ${dateString}. Please indicate your attendance using the commands /coming or /notcoming [reason].`
});

const standardiseText = text => {
  return text.trim().toLowerCase();
};

while (sentDates.length === 0) { // TODO: use infinite loop with timeout
  let today = new Date();
  if (inSchedule(today) && !savedDate(today, sentDates)) {
    console.log("Sending message...");
    bot.telegram.sendMessage(process.env.CHAT_ID, "Hello").catch(console.error);
    sentDates.push(today);
  }
}