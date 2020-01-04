require("dotenv").config();
const Telegraf = require("telegraf");
const {
  upsertUser,
  toggleResponse,
  getMessageById
} = require("./database");
// const { getPoll } = require("./services/pollBuilder");
// const { sendPoll } = require("./services/messages");

const BOT_TOKEN = process.env.BOT_TOKEN || "";

let bot = null;

const launch = () => {
  bot = new Telegraf(BOT_TOKEN, { polling: true });

  bot.action(new RegExp(/__OPTION__ID__[0-9]+__/), ctx => {
    const optionIdString = ctx.update.callback_query.data;
    const optionId = optionIdString
      .replace("__OPTION__ID__", "")
      .replace("__", "");
    const userId = ctx.update.callback_query.from.id;
    upsertUser(ctx.update.callback_query.from);
    toggleResponse(userId, optionId);

    // getMessageById(
    //   ctx.update.callback_query.message.message_id,
    //   ctx.update.callback_query.message.chat.id,
    //   (err, result) => {
    //     getPoll(result, (err, message, inlineKeyboard) => {
    //       console.log('MESSAGE: ', message);
    //     });
    //   }
    // );
    // sendPoll(poll); TODO: circular dependency

    const optionText = ctx.update.callback_query.message.reply_markup.inline_keyboard.find(
      option => option[0].callback_data === optionIdString
    )[0].text;
    ctx.answerCbQuery(`You responded with ${optionText}`);
  });

  bot.launch();
};

const getBot = () => {
  if (bot) {
    return bot;
  }
  throw new Error("Bot not initialised!");
};

module.exports = {
  launch,
  getBot
};
