const moment = require("moment");
const {getConnection} = require("../mysql");

const getNewMessages = (callback) => {
  const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  const query = `SELECT * FROM messages WHERE send_date < '${now}' AND close_date > '${now}' AND is_sent = false`;
  getConnection().query(query, (err, result) => {
    console.log("results: ", result);
    callback(err, result);
  });
};

const getOptionsForMessage = (messageId, chatId, callback) => {
  const query = `SELECT * FROM options WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  getConnection().query(query, (err, result) => {
    callback(err, result);
  });
};

const upsertMessage = (message, newMessageId) => {
  const query = `UPDATE messages SET message_id = '${newMessageId}', text = '${
    message.text
  }', send_date = '${moment(message.send_date).format(
    "YYYY-MM-DD HH:mm:ss"
  )}', close_date = '${moment(message.close_date).format(
    "YYYY-MM-DD HH:mm:ss"
  )}', is_poll = ${message.is_poll}, is_sent = ${
    message.is_sent
  }, is_closed = ${message.is_closed}, chat_id = '${
    message.chat_id
  }' WHERE message_id = '${message.message_id}' AND chat_id = '${
    message.chat_id
  }'`;
  getConnection().query(query, err => {
    if (err) throw err;
  });
};

module.exports = {
  getNewMessages,
  getOptionsForMessage,
  upsertMessage
};
