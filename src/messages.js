const {
  getNewMessages,
  upsertMessage,
  getPollResponses,
  upsertUser,
  toggleResponse,
  getMessageById
} = require("./database");
const { getBot } = require("./bot");
const moment = require("moment");
const { Extra } = require("telegraf");

const sendNewMessages = async () => {
  try {
    const newMessages = await getNewMessages();
    console.log(`Found ${newMessages.length} new messages to be sent`);
    if (newMessages) {
      newMessages.forEach(message => {
        if (message.is_poll) {
          sendPoll(message);
        } else {
          sendMessage(message);
        }
      });
    }
  } catch (err) {
    console.error("Error sending new messages: ", err);
  }
};

const closeOldMessages = () => {
  // TODO:
};

const sendPoll = async poll => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      bot = getBot();
      const { message, inlineKeyboard } = await getPollContent(poll);
      bot.telegram
        .sendMessage(poll.chat_id, message, inlineKeyboard)
        .then(async m => {
          bot.telegram.pinChatMessage(poll.chat_id, m.message_id);
          poll.is_sent = true;
          await upsertMessage(poll, m.message_id);
          console.log(
            `Sent poll ${m.message_id} to chat ${
              poll.chat_id
            } on ${moment.utc().toString()}`
          );
        });
    }
  } catch (err) {
    console.error(
      `Error sending new poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`
    );
    throw err;
  }
  return poll;
};

const updatePoll = async poll => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      bot = getBot();
      const { message, inlineKeyboard } = await getPollContent(poll);
      bot.telegram.editMessageText(
        poll.chat_id,
        poll.message_id,
        poll.message_id,
        message,
        inlineKeyboard
      );
      console.log(
        `Updated poll ${poll.message_id} in chat ${
          poll.chat_id
        } on ${moment.utc().toString()}`
      );
    }
  } catch (err) {
    console.error(
      `Error updating poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`
    );
    throw err;
  }
  return poll;
};

const sendMessage = async message => {
  try {
    getBot()
      .telegram.sendMessage(message.chat_id, message.text)
      .then(async m => {
        getBot().telegram.pinChatMessage(message.chat_id, m.message_id);
        message.is_sent = true;
        await upsertMessage(message, m.message_id);
        console.log(
          `Sent message ${m.message_id} to chat ${
            message.chat_id
          } on ${moment.utc().toString()}`
        );
      });
  } catch (err) {
    console.error(
      `Error sending new message:\nMessage: ${JSON.stringify(
        message
      )}\nError: ${err}`
    );
    throw err;
  }
  return message;
};

const getPollContent = async poll => {
  const rows = await getPollResponses(poll.message_id, poll.chat_id);
  const options = {};
  const responsesMap = {};
  let numResponses = 0;
  rows.forEach(row => {
    if (!row.username && !row.first_name) {
      return;
    }
    numResponses++;
    const displayName = row.username
      ? `@${row.username}`
      : `[${row.first_name}](tg://user?id=${row.user_id})`;
    if (responsesMap[row.text]) {
      responsesMap[row.text].push(displayName);
    } else {
      responsesMap[row.text] = [displayName];
    }
    if (!options[row.option_id]) {
      options[row.option_id] = row.text;
    }
  });
  const inlineKeyboard = Extra.markdown().markup(m =>
    m.inlineKeyboard(
      Object.keys(options).map(key =>
        m.callbackButton(options[key], `__OPTION__ID__${key}__`)
      ),
      { columns: 1 }
    )
  );
  let message = `${poll.content}\n\n`;
  Object.entries(responsesMap).forEach(([optionText, respondedUsernames]) => {
    message += `*${optionText} - ${respondedUsernames.length} (${
      numResponses === 0
        ? "-"
        : Math.round((respondedUsernames.length / numResponses) * 100)
    }%)*\n`;
    message += `${respondedUsernames.join(", ")}\n`;
    message += "\n";
  });
  message += `👥 *${numResponses} people* have responded so far.`;
  return { message, inlineKeyboard };
};

const initBotActions = () => {
  getBot().action(new RegExp(/__OPTION__ID__[0-9]+__/), async ctx => {
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
      const rows = await getMessageById(messageId, chatId);
      if (rows) {
        updatePoll(rows);
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
};

module.exports = {
  sendNewMessages,
  closeOldMessages,
  initBotActions
};
