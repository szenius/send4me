const {
  getNewMessages,
  updateMessageByMessageAndChatId,
  getPollResponses
} = require("./database");
const { getBot } = require("./bot");
const moment = require("moment");
const { Extra } = require("telegraf");

const sendNewMessages = async () => {
  try {
    const [rows] = await getNewMessages();
    console.log(`Found ${rows.length} new messages to be sent`);
    if (rows) {
      rows.forEach((message) => {
        if (message.is_poll) {
          sendPoll(message);
        } else {
          sendMessage(message);
        }
      });
    }
  } catch (err) {
    console.error('Error sending new messages: ', err);
  }
};

const closeOldMessages = () => {
  // TODO:
};

const sendPoll = async (poll) => {
  try {
    if (poll && poll.message_id && poll.chat_id) {
      bot = getBot();
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
      const { message, inlineKeyboard } = await getPollContent(poll);
      ctx.telegram.editMessageText(
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
    console.error(`Error updating poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`);
    throw err;
  }
  return poll;
};

const sendMessage = async (message) => {
  try {
    getBot()
      .telegram.sendMessage(message.chat_id, message.text)
      .then(async (m) => {
        getBot().telegram.pinChatMessage(message.chat_id, m.message_id);
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

const getPollContent = async (poll) => {
  const [rows] = await getPollResponses(poll.message_id, poll.chat_id);
  const optionIdToTextMap = {};
  const optionTextToResponsesMap = {};
  let numResponses = 0;
  rows.forEach((row) => {
    if (!optionIdToTextMap[row.option_id]) {
      optionIdToTextMap[row.option_id] = row.text;
      optionTextToResponsesMap[row.text] = [];
    }
    if (!row.username && !row.first_name) {
      return;
    }
    numResponses++;
    const displayName = row.username
      ? `@${row.username}`
      : `[${row.first_name}](tg://user?id=${row.user_id})`;
    optionTextToResponsesMap[row.text].push(displayName);
  });
  const inlineKeyboard = Extra.markdown().markup((m) =>
    m.inlineKeyboard(
      Object.keys(optionIdToTextMap).map((key) =>
        m.callbackButton(optionIdToTextMap[key], `__OPTION__ID__${key}__`),
      ),
      {columns: 1},
    ),
  );
  let message = `${poll.content}\n\n`;
  Object.entries(optionTextToResponsesMap).forEach(
    ([optionText, respondedUsernames]) => {
      message += `*${optionText} - ${respondedUsernames.length} (${
        numResponses === 0
          ? "-"
          : Math.round((respondedUsernames.length / numResponses) * 100)
      }%)*\n`;
      message += `${respondedUsernames.join(", ")}\n`;
      message += "\n";
    }
  );
  message += `👥 *${numResponses} people* have responded so far.`;
  return {message, inlineKeyboard};
};

module.exports = {
  sendNewMessages,
  closeOldMessages,
  updatePoll
};
