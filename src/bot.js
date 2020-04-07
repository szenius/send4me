require("dotenv").config();
const Telegraf = require("telegraf");
const { upsertUser, toggleResponse, getMessageById } = require("./database");
const { updatePoll } = require("./messages");
const BOT_TOKEN = process.env.BOT_TOKEN || "";

let bot = null;

const setUpBot = () => {
  bot = new Telegraf(BOT_TOKEN, { polling: true });

  bot.command("health", ctx => {
    ctx.reply("OK");
  });

  bot.action(new RegExp(/__OPTION__ID__[0-9]+__/), async ctx => {
    const optionIdString = ctx.update.callback_query.data;
    const optionId = optionIdString
      .replace("__OPTION__ID__", "")
      .replace("__", "");
    const userId = ctx.update.callback_query.from.id;
    await upsertUser(ctx.update.callback_query.from);

    const messageId = ctx.update.callback_query.message.message_id;
    const isToggleOn = await toggleResponse(userId, optionId, messageId);
    const chatId = ctx.update.callback_query.message.chat.id;
    console.log(
      `User ${userId} has responded with ${optionId} for message ${messageId} in chat ${chatId}`
    );

    try {
      const [rows] = await getMessageById(messageId, chatId);
      const message = rows[0];
      if (message) {
        await updatePoll(message, ctx);
      }
    } catch (err) {
      console.warn(
        `Error sending poll from action with id ${optionIdString}: ${err}`
      );
    }

    const optionText = ctx.update.callback_query.message.reply_markup.inline_keyboard.find(
      option => option[0].callback_data === optionIdString
    )[0].text;
    ctx.answerCbQuery(
      isToggleOn
        ? `You responded with '${optionText}'`
        : `You retracted your response '${optionText}'`
    );
  });

  bot.launch();
};

const getBot = () => {
  if (bot) {
    return bot;
  }
  throw new Error('Bot not initialised!');
};

module.exports = {
  setUpBot,
  getBot
};
