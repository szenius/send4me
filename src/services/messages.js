const { getNewMessages, upsertMessage } = require("./database");
const { getPoll } = require("./pollBuilder");
const { getBot } = require("../bot");
const moment = require("moment");

const sendNewMessages = () => {
  try {
    getNewMessages((err, newMessages) => {
      if (err) throw err;
      newMessages.forEach(message => {
        if (message.is_poll) {
          console.log("sending poll: ", JSON.stringify(message));
          sendPoll(message);
        } else {
          console.log("sending message: ", JSON.stringify(message));
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
  console.log("close");
};

const sendPoll = poll => {
  try {
    getPoll(poll, (err, message, inlineKeyboard) => {
      if (err) console.error("Error getting poll: ", err);
      getBot()
        .telegram.sendMessage(poll.chat_id, message, inlineKeyboard)
        .then(m => {
          getBot().telegram.pinChatMessage(poll.chat_id, m.message_id);
          poll.is_sent = true;
          upsertMessage(poll, m.message_id);
          console.log(
            `Sent poll ${m.message_id} to chat ${
              poll.chat_id
            } on ${moment.utc().toString()}`
          );
        })
    });
  } catch (err) {
    console.error(
      `Error sending new poll:\nPoll: ${JSON.stringify(poll)}\nError: ${err}`
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

module.exports = {
  sendNewMessages,
  closeOldMessages,
  sendPoll
};
