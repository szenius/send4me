require('dotenv').config();
const Telegraf = require('telegraf');
const {
  getChatsByAdminUserId,
  upsertUser,
  toggleResponse,
  getMessageById,
  insertMessage,
} = require('./database');
const {updatePoll} = require('./messages');
const {Extra} = require('telegraf');
const {getInMemoryCache} = require('./cache');
const axios = require('axios');
const csv = require('csvtojson');

const BOT_TOKEN = process.env.BOT_TOKEN || '';

let bot = null;

const setUpBot = () => {
  bot = new Telegraf(BOT_TOKEN, {polling: true});

  bot.start((ctx) =>
    ctx.reply(
      'Hello! I can help you schedule polls to be sent to a group on a regular basis. Use /schedule to get started.',
    ),
  );

  bot.command('help', (ctx) => {
    ctx.reply(
      'Hello! I can help you schedule polls to be sent to a group on a regular basis. Use /schedule to get started.',
    );
  });

  bot.command('schedule', async (ctx) => {
    const chatType = ctx.update.message.chat.type;
    if (chatType !== 'private') {
      ctx.reply('Scheduling only works in private conversations. Try direct messaging me!');
      return;
    }
    const userId = ctx.update.message.from.id;
    const [rows] = await getChatsByAdminUserId(userId);
    if (rows.length === 0) {
      ctx.reply(
        "It doesn't seem like you are an admin for any chat. To become an admin, please contact @szenius.",
      );
      return;
    }
    const message = 'Which of these chats do you want to send this message to?';
    const inlineKeyboard = Extra.markdown().markup((m) =>
      m.inlineKeyboard(
        rows.map((row) => m.callbackButton(row.name, `__CHOOSE__CHAT__${row.chat_id}__`)),
        {columns: 1},
      ),
    );
    ctx.reply(message, inlineKeyboard);
  });

  bot.on('document', async (ctx) => {
    const chatId = ctx.update.message.chat.id;
    const targetChatId = getInMemoryCache().get(chatId);
    if (!targetChatId) {
      return;
    }

    const {file_id: fileId, mime_type: mimeType} = ctx.update.message.document;
    if (mimeType !== 'text/csv') {
      ctx.reply('Please upload a CSV file.');
      return;
    }

    getInMemoryCache().remove(chatId);
    ctx.reply('Received file. Please wait as we schedule your messages...');

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl);

    // TODO: make async
    csv()
      .fromString(response.data)
      .then(async (rows) => {
        for (const row of rows) {
          await insertMessage({
            messageId:
              Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            content: row.message,
            sendDate: row.send_date,
            closeDate: row.close_date,
            isPoll: false,
            chatId: targetChatId,
          });
        }
      });

    ctx.reply('Scheduled your messages. You can use /view to see them.');
  });

  bot.action(new RegExp(/__CHOOSE__CHAT__-[0-9]+__/), async (ctx) => {
    const chatIdString = ctx.update.callback_query.data;
    const targetChatId = chatIdString.replace('__CHOOSE__CHAT__', '').replace('__', '');
    const userId = ctx.update.callback_query.from.id;
    const sourceChatId = ctx.update.callback_query.message.chat.id;
    getInMemoryCache().set(sourceChatId, targetChatId);
    console.log(`User ${userId} (in chat ${sourceChatId}) is adding a schedule to ${targetChatId}`);
    ctx.reply(`Please upload a schedule file. Ensure that it is a CSV file with the following columns:

    description
    send_date
    close_date

    TODO:
    `);
  });

  bot.action(new RegExp(/__OPTION__ID__[0-9]+__/), async (ctx) => {
    const optionIdString = ctx.update.callback_query.data;
    const optionId = optionIdString.replace('__OPTION__ID__', '').replace('__', '');
    const userId = ctx.update.callback_query.from.id;
    await upsertUser(ctx.update.callback_query.from);

    const messageId = ctx.update.callback_query.message.message_id;
    const isToggleOn = await toggleResponse(userId, optionId, messageId);
    const chatId = ctx.update.callback_query.message.chat.id;
    console.log(`User ${userId} has responded with ${optionId} for message ${messageId} in chat ${chatId}`);

    try {
      const [rows] = await getMessageById(messageId, chatId);
      const message = rows[0];
      if (message) {
        await updatePoll(message, ctx);
      }
    } catch (err) {
      console.warn(`Error sending poll from action with id ${optionIdString}: ${err}`);
    }

    const optionText = ctx.update.callback_query.message.reply_markup.inline_keyboard.find(
      (option) => option[0].callback_data === optionIdString,
    )[0].text;
    ctx.answerCbQuery(
      isToggleOn ? `You responded with '${optionText}'` : `You retracted your response '${optionText}'`,
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
  getBot,
};
