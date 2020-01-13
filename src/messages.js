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

const sendNewMessages = () => {
  try {
    getNewMessages((err, newMessages) => {
      console.log(`Found ${newMessages.length} new messages to be sent`);
      if (err) throw err;
      newMessages.forEach(message => {
        if (message.is_poll) {
          sendPoll(message);
        } else {
          sendMessage(message);
        }
      });
    });
  } catch (err) {
    console.error("Error sending new messages: ", err);
  }
};

const closeOldMessages = () => {
  // TODO:
};

const sendPoll = poll => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      bot = getBot();
      getPollContent(poll, (err, message, inlineKeyboard) => {
        if (err) console.error("Error getting poll: ", err);
        bot.telegram
          .sendMessage(poll.chat_id, message, inlineKeyboard)
          .then(m => {
            bot.telegram.pinChatMessage(poll.chat_id, m.message_id);
            poll.is_sent = true;
            upsertMessage(poll, m.message_id);
            console.log(
              `Sent poll ${m.message_id} to chat ${
                poll.chat_id
              } on ${moment.utc().toString()}`
            );
          });
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

const updatePoll = poll => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      bot = getBot();
      getPollContent(poll, (err, message, inlineKeyboard) => {
        if (err) {
          console.error("Error getting poll: ", err);
        } else {
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
      });
    }
  } catch (err) {
    console.error(
      `Error updating poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`
    );
    throw err;
  }
  return poll;
};

const sendMessage = message => {
  try {
    getBot()
      .telegram.sendMessage(message.chat_id, message.text)
      .then(m => {
        getBot().telegram.pinChatMessage(message.chat_id, m.message_id);
        message.is_sent = true;
        upsertMessage(message, m.message_id);
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

const getPollContent = (poll, callback) => {
  getPollResponses(poll.message_id, poll.chat_id, (err, result) => {
    if (err) console.error("Error getting poll with responses: ", err);
    const options = {};
    const responsesMap = {};
    let numResponses = 0;
    result.forEach(row => {
      if (!options[row.option_id]) {
        options[row.option_id] = row.text;
        responsesMap[row.text] = responsesMap[row.text] || [];
      }
      if (!row.username && !row.first_name) {
        return;
      }
      numResponses++;
      const displayName = row.username
        ? `@${row.username}`
        : `[${row.first_name}](tg://user?id=${row.user_id})`;
      responsesMap[row.text].push(displayName);
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
    callback(err, message, inlineKeyboard);
  });
};

const initBotActions = () => {
  getBot().action(new RegExp(/__OPTION__ID__[0-9]+__/), ctx => {
    const optionIdString = ctx.update.callback_query.data;
    const optionId = optionIdString
      .replace("__OPTION__ID__", "")
      .replace("__", "");
    const userId = ctx.update.callback_query.from.id;
    upsertUser(ctx.update.callback_query.from);

    const messageId = ctx.update.callback_query.message.message_id;
    toggleResponse(userId, optionId, messageId, isToggleOn => {
      const chatId = ctx.update.callback_query.message.chat.id;
      console.log(
        `User ${userId} has responded with ${optionId} for message ${messageId} in chat ${chatId}`
      );

      getMessageById(messageId, chatId, (err, result) => {
        if (err) {
          console.error(
            `Could not get message by ID for message ${messageId} in chat ${chatId}: `,
            err
          );
        } else {
          try {
            if (result) {
              updatePoll(result);
            }
          } catch (err) {
            console.warn(
              `Error sending poll from action with id ${optionIdString}: ${err}`
            );
          }
        }
      });

      const optionText = ctx.update.callback_query.message.reply_markup.inline_keyboard.find(
        option => option[0].callback_data === optionIdString
      )[0].text;
      ctx.answerCbQuery(
        isToggleOn
          ? `You responded with '${optionText}'`
          : `You retracted your response '${optionText}'`
      );
    });
  });
};

module.exports = {
  sendNewMessages,
  closeOldMessages,
  initBotActions
};
