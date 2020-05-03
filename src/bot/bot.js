require('dotenv').config();
const Telegraf = require('telegraf');
const {
  getChatsByAdminUserId,
  upsertUser,
  toggleResponse,
  getMessageById,
  insertMessage,
  updateMessageByMessageAndChatId,
} = require('../database/database');
const {Extra} = require('telegraf');
const {getInMemoryCache} = require('../database/cache');
const axios = require('axios');
const csv = require('csvtojson');
const moment = require('moment');
const {getPollContent} = require('../message/getPollContent');
const {WELCOME, SCHEDULE} = require('./responses');

const BOT_TOKEN = process.env.BOT_TOKEN || '';

let bot = null;

const setUpBot = () => {
  bot = new Telegraf(BOT_TOKEN, {polling: true});

  bot.start((ctx) => ctx.reply(WELCOME));

  bot.command('help', (ctx) => ctx.reply(WELCOME));

  bot.command('schedule', async (ctx) => {
    const chatType = ctx.update.message.chat.type;
    if (chatType !== 'private') {
      ctx.reply(SCHEDULE.ERROR_NOT_PRIVATE_CHAT);
      return;
    }
    const userId = ctx.update.message.from.id;
    const [rows] = await getChatsByAdminUserId(userId);
    if (rows.length === 0) {
      ctx.reply(SCHEDULE.ERROR_NOT_ADMIN);
      return;
    }
    const inlineKeyboard = Extra.markdown().markup((m) =>
      m.inlineKeyboard(
        rows.map((row) => m.callbackButton(row.name, `__CHOOSE__CHAT__${row.chat_id}__`)),
        {columns: 1},
      ),
    );
    ctx.reply(SCHEDULE.MESSAGE_CHOOSE_CHAT, inlineKeyboard);
  });

  bot.command('view', async (ctx) => {
    ctx.reply('COMING SOON');
  });

  bot.on('document', async (ctx) => {
    const chatId = ctx.update.message.chat.id;
    const targetChatId = getInMemoryCache().get(chatId);
    if (!targetChatId) {
      return;
    }

    const {file_id: fileId, mime_type: mimeType} = ctx.update.message.document;
    if (mimeType !== 'text/csv') {
      ctx.reply(SCHEDULE.ERROR_NOT_CSV_FILE + '\n\n' + SCHEDULE.MESSAGE_CSV_FILE_FORMAT, Extra.markdown());
      return;
    }

    getInMemoryCache().remove(chatId);
    ctx.reply(SCHEDULE.MESSAGE_ADDING_SCHEDULE);

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl);

    const userId = ctx.update.message.from.id;
    csv()
      .fromString(response.data)
      .then(async (rows) => {
        for (const row of rows) {
          const messageId =
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          await insertMessage({
            messageId,
            content: row.message,
            sendDate: row.send_date,
            closeDate: row.close_date,
            isPoll: false,
            chatId: targetChatId,
          });
          console.log(`User ${userId} added message ${messageId} to chat ${targetChatId}`);
        }
        ctx.reply(SCHEDULE.MESSAGE_ADDED_SCHEDULE);
      });
  });

  bot.action(new RegExp(/__CHOOSE__CHAT__-[0-9]+__/), async (ctx) => {
    const chatIdString = ctx.update.callback_query.data;
    const targetChatId = chatIdString.replace('__CHOOSE__CHAT__', '').replace('__', '');
    const userId = ctx.update.callback_query.from.id;
    const sourceChatId = ctx.update.callback_query.message.chat.id;
    getInMemoryCache().set(sourceChatId, targetChatId);
    console.log(`User ${userId} (in chat ${sourceChatId}) is adding a schedule to ${targetChatId}`);
    ctx.reply(
      SCHEDULE.MESSAGE_UPLOAD_SCHEDULE_FILE + '\n\n' + SCHEDULE.MESSAGE_CSV_FILE_FORMAT,
      Extra.markdown(),
    );
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

const sendPoll = async (poll) => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      const {message, inlineKeyboard} = await getPollContent(poll);
      bot.telegram.sendMessage(poll.chat_id, message, inlineKeyboard).then(async (m) => {
        bot.telegram.pinChatMessage(poll.chat_id, m.message_id);
        poll.is_sent = true;
        await updateMessageByMessageAndChatId(poll, m.message_id);
        console.log(`Sent poll ${m.message_id} to chat ${poll.chat_id} on ${moment.utc().toString()}`);
      });
    }
  } catch (err) {
    console.error(`Error sending new poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`);
    throw err;
  }
  return poll;
};

const updatePoll = async (poll, ctx) => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      const {message, inlineKeyboard} = await getPollContent(poll);
      ctx.telegram.editMessageText(poll.chat_id, poll.message_id, poll.message_id, message, inlineKeyboard);
      console.log(`Updated poll ${poll.message_id} in chat ${poll.chat_id} on ${moment.utc().toString()}`);
    }
  } catch (err) {
    console.error(`Error updating poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`);
    throw err;
  }
  return poll;
};

const sendMessage = async (message) => {
  try {
    bot.telegram.sendMessage(message.chat_id, message.content).then(async (m) => {
      bot.telegram.pinChatMessage(message.chat_id, m.message_id);
      message.is_sent = true;
      await updateMessageByMessageAndChatId(message, m.message_id);
      console.log(`Sent message ${m.message_id} to chat ${message.chat_id} on ${moment.utc().toString()}`);
    });
  } catch (err) {
    console.error(`Error sending new message:\nMessage: ${JSON.stringify(message)}\nError: ${err}`);
    throw err;
  }
  return message;
};

module.exports = {
  setUpBot,
  sendMessage,
  sendPoll,
};
